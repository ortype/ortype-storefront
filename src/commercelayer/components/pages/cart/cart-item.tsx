import { useOrderContext } from '@/commercelayer/providers/Order'
import {
  calculateLineItemPrice,
  formatPrice,
} from '@/commercelayer/utils/prices'
import { Tag } from '@/components/ui/tag'
import {
  Box,
  IconButton as ChakraIconButton,
  Flex,
  HStack,
  Link,
  Menu,
  Portal,
  SimpleGrid,
  Stack,
  Text,
  VStack,
} from '@chakra-ui/react'
import { type SkuOption } from '@commercelayer/sdk'
import { CloseIcon } from '@sanity/icons'
import { AnimatePresence, motion } from 'framer-motion'
import React, { useMemo } from 'react'
import type { CartBufferItem } from '.'

interface CartItemProps {
  item: CartBufferItem
}

export const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const {
    skuOptions,
    mediaTypes,
    licenseSize,
    selections,
    groupResolutions,
    toggleStyle,
    setStyleLicenseTypes,
  } = useOrderContext()

  const { skuCode, parentUid, entry } = item

  // Sort index from mediaTypes so selections follow Sanity order
  const mediaKeyOrder = useMemo(() => {
    if (!mediaTypes?.length) return null
    return new Map(mediaTypes.map((m, i) => [m._key, i]))
  }, [mediaTypes])

  const sortByReference = (refs: string[]): string[] => {
    if (!mediaKeyOrder) return refs
    return [...refs].sort(
      (a, b) =>
        (mediaKeyOrder.get(a) ?? Infinity) - (mediaKeyOrder.get(b) ?? Infinity)
    )
  }

  // Resolve the SkuOption objects for this style's license types
  const selectedSkuOptions = useMemo(() => {
    const refs = entry.licenseTypes ?? []
    return sortByReference(refs)
      .map((ref) => skuOptions?.find((o) => o.reference === ref))
      .filter(Boolean) as SkuOption[]
  }, [entry.licenseTypes, skuOptions, mediaKeyOrder])

  // Derive select-compatible { value, label } formats from skuOptions
  const formattedTypeOptions = skuOptions?.map((o) => ({
    value: o.reference,
    label: o.name,
  }))

  // Label lookup keyed by SkuOption.reference, for tag display
  const labelByReference = useMemo(() => {
    const map = new Map<string, string>()
    for (const option of formattedTypeOptions ?? []) {
      map.set(option.value, option.label)
    }
    return map
  }, [formattedTypeOptions])

  const selectedValues = entry.licenseTypes ?? []

  // License types not yet selected — shown in the "Edit license" menu
  const remainingOptions = useMemo(() => {
    const selected = new Set(entry.licenseTypes ?? [])
    return (formattedTypeOptions ?? []).filter(
      (option) => !selected.has(option.value)
    )
  }, [formattedTypeOptions, entry.licenseTypes])

  // Count siblings in this parentUid group
  const groupCount = Object.keys(selections[parentUid] ?? {}).length

  // Disable individual removal when this style belongs to a fully-selected group.
  // A style is "locked" if every style in its resolved group is currently selected.
  const isInFullGroup = useMemo(() => {
    const resolved = groupResolutions[parentUid] ?? []
    const selectedCodes = new Set(Object.keys(selections[parentUid] ?? {}))
    return resolved.some(
      (g) =>
        g.includedSkuCodes.includes(skuCode) &&
        g.includedSkuCodes.every((code) => selectedCodes.has(code))
    )
  }, [groupResolutions, selections, parentUid, skuCode])
  const canRemove = !isInFullGroup

  // Optimistic price from buffer
  const displayPrice = useMemo(() => {
    if (!licenseSize || selectedSkuOptions.length === 0) return 0
    return formatPrice(
      calculateLineItemPrice({
        skuOptions: selectedSkuOptions,
        sizeModifier: licenseSize.modifier,
        count: groupCount,
      })
    )
  }, [selectedSkuOptions, licenseSize, groupCount])

  // Full price (no discount) for strike-through
  const fullPrice = useMemo(() => {
    if (!licenseSize || selectedSkuOptions.length === 0) return 0
    return formatPrice(
      calculateLineItemPrice({
        skuOptions: selectedSkuOptions,
        sizeModifier: licenseSize.modifier,
        count: 1,
      })
    )
  }, [selectedSkuOptions, licenseSize])

  const handleAddType = (value: string) => {
    const next = sortByReference([...selectedValues, value])
    setStyleLicenseTypes({ parentUid, skuCode, licenseTypes: next })
  }

  const handleRemoveType = (value: string) => {
    const next = sortByReference(selectedValues.filter((v) => v !== value))
    setStyleLicenseTypes({ parentUid, skuCode, licenseTypes: next })
  }

  const handleRemove = () => {
    canRemove &&
      toggleStyle({
        parentUid,
        skuCode,
        styleMetadata: entry,
      })
  }

  return (
    <>
      <SimpleGrid columns={[1, null, 2]} gap={3} bg={'#F8F8F8'} p={3}>
        <Stack direction={'row'} gap={2} alignItems={'flex-start'}>
          <Link onClick={handleRemove} cursor={'pointer'}>
            <ChakraIconButton
              variant="ghost"
              rounded={'full'}
              disabled={!canRemove}
              px={0}
              size={'sm'}
              _hover={{ bg: 'white' }}
              aria-label="Remove"
              css={{
                '& svg': {
                  color: 'brand.600',
                },
              }}
            >
              <CloseIcon width={'2rem'} height={'2rem'} />
            </ChakraIconButton>
          </Link>

          <Text
            fontSize={'2xl'}
            lineHeight={1.3}
            as={'span'}
            className={skuCode}
          >
            {entry.name}
          </Text>
        </Stack>
        <Flex direction={'row'} alignItems={'flex-start'}>
          <Box flexGrow={1}>
            <HStack gap={2} flexWrap={'wrap'} alignItems={'center'}>
              <AnimatePresence mode={'sync'} initial={false}>
                {selectedValues.map((value) => (
                  <motion.div
                    key={value}
                    style={{ display: 'inline-flex' }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                  >
                    <Tag
                      size={'xl'}
                      variant={'solid'}
                      closable
                      onClose={() => handleRemoveType(value)}
                    >
                      {labelByReference.get(value) ?? value}
                    </Tag>
                  </motion.div>
                ))}
              </AnimatePresence>

              {remainingOptions.length > 0 && (
                <Menu.Root variant={'outline'} size={'md'}>
                  <Menu.Trigger
                    // border={0}
                    // borderBottom={'2px solid #000'}
                    // borderRadius={0}
                    cursor={'pointer'}
                    _hover={{
                      bg: 'colorPalette.fg',
                      color: 'colorPalette.bg',
                    }}
                    // borderRadius={'100px'}
                    // _hover={{
                    //   borderRadius: '0px',
                    // }}
                    transition={'background 200ms ease-out'}
                  >
                    Add license
                  </Menu.Trigger>
                  <Portal>
                    <Menu.Positioner>
                      <Menu.Content>
                        {remainingOptions.map((option) => (
                          <Menu.Item
                            key={option.value}
                            value={option.value}
                            onClick={() => handleAddType(option.value)}
                          >
                            {option.label}
                          </Menu.Item>
                        ))}
                      </Menu.Content>
                    </Menu.Positioner>
                  </Portal>
                </Menu.Root>
              )}
            </HStack>
          </Box>
          <VStack
            minW={28}
            gap={1}
            alignItems={'flex-end'}
            fontVariantNumeric={'tabular-nums'}
            pr={3}
          >
            <HStack gap={4}>
              <Text as={'span'} fontSize={'sm'}>
                {displayPrice} {'EUR'}
              </Text>
            </HStack>
            {displayPrice !== fullPrice && (
              <Text
                as={'span'}
                textDecoration={'line-through'}
                fontSize={'sm'}
                color={'brand.400'}
              >
                {fullPrice} {'EUR'}
              </Text>
            )}
          </VStack>
        </Flex>
      </SimpleGrid>
    </>
  )
}
