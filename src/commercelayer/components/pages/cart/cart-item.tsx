import { useOrderContext } from '@/commercelayer/providers/Order'
import {
  calculateLineItemPrice,
  formatPrice,
} from '@/commercelayer/utils/prices'
import {
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
} from '@/components/ui/license-type-select'
import {
  Box,
  IconButton as ChakraIconButton,
  createListCollection,
  Flex,
  HStack,
  Link,
  SimpleGrid,
  Stack,
  Text,
  VStack,
} from '@chakra-ui/react'
import { type SkuOption } from '@commercelayer/sdk'
import { CloseIcon } from '@sanity/icons'
import React, { useMemo } from 'react'
import type { CartBufferItem } from '.'

interface CartItemProps {
  item: CartBufferItem
}

export const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const {
    committedGroups,
    skuOptions,
    mediaTypes,
    licenseSize,
    selections,
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

  // Derive select-compatible formats from skuOptions
  const formattedTypeOptions = skuOptions?.map((o) => ({
    value: o.reference,
    label: o.name,
  }))

  const typeOptionsCollection = useMemo(
    () => createListCollection({ items: formattedTypeOptions }),
    [formattedTypeOptions]
  )
  const selectedValues = entry.licenseTypes ?? []

  // Count siblings in this parentUid group
  const groupCount = Object.keys(selections[parentUid] ?? {}).length

  // committedGroups doesn't contain an Object.key that matches this `parentUid`
  const canRemove = !(item.parentUid in committedGroups)

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

  const handleTypeChange = (e: { value: string[] }) => {
    const sorted = sortByReference(e.value)
    setStyleLicenseTypes({ parentUid, skuCode, licenseTypes: sorted })
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
      <SimpleGrid columns={[1, null, 2]} gap={3} bg={'brand.0'} p={3}>
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
            <SelectRoot
              variant={'flushed'}
              size={'sm'}
              fontSize={'md'}
              collection={typeOptionsCollection}
              value={selectedValues}
              onValueChange={handleTypeChange}
              multiple
            >
              <SelectValueText placeholder="Select a type" />
              <SelectTrigger>{'Edit license'}</SelectTrigger>
              <SelectContent portalled={false}>
                {formattedTypeOptions.map((option) => (
                  <SelectItem key={option.value} item={option}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </SelectRoot>
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
