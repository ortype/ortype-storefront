import type { CartBufferItem } from '@/commercelayer/providers/cart'
import { useCartContext } from '@/commercelayer/providers/cart'
import {
  calculateLineItemPrice,
  formatPrice,
} from '@/commercelayer/utils/prices'
import { Tag } from '@/components/ui/tag'
import {
  Box,
  Button,
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

interface CartItemProps {
  item: CartBufferItem
}

export const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const {
    skuOptions,
    mediaTypes,
    licenseSize,
    toggleStyle,
    setStyleLicenseTypes,
  } = useCartContext()

  const { skuCode, parentUid, entry, groupCount, isInFullGroup } = item
  const canRemove = !isInFullGroup

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
      <SimpleGrid
        columns={[1, null, 2]}
        gap={3}
        bg={'brand.50'}
        p={3}
        my={0.5}
        ml={6}
        position={'relative'}
      >
        {!isInFullGroup && (
          <Link
            onClick={handleRemove}
            cursor={'pointer'}
            pos={'absolute'}
            left={-6}
            top={0}
            bottom={0}
          >
            <ChakraIconButton
              variant="ghost"
              rounded={0}
              h={'full'}
              minW={4}
              disabled={!canRemove}
              px={0}
              size={'sm'}
              _hover={{ bg: 'brand.50' }}
              aria-label="Remove"
              css={{
                '& svg': {
                  color: 'colorPalette.fg',
                },
              }}
            >
              <CloseIcon width={'2rem'} height={'2rem'} />
            </ChakraIconButton>
          </Link>
        )}
        <Stack
          direction={'row'}
          gap={2}
          alignItems={'flex-start'}
          pos={'relative'}
        >
          <Text
            fontSize={'2xl'}
            lineHeight={1.3}
            as={'span'}
            className={skuCode}
          >
            {entry.name}
          </Text>
        </Stack>
        <Flex
          direction={'row'}
          alignItems={'flex-start'}
          alignContent={'center'}
        >
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
                      size={'md'}
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
                <Menu.Root variant={'outline'} size={'sm'}>
                  <Menu.Trigger asChild>
                    <Button borderRadius={0} variant="text" size="sm" h={5}>
                      {'Add license'}
                    </Button>
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
                {displayPrice === 0 ? `–– EUR` : `${displayPrice} EUR`}
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
