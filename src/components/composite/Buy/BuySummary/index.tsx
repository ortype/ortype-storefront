import { useOrderContext } from '@/commercelayer/providers/Order'
import { sizes } from '@/lib/settings'
import { Box, Heading, Show, SimpleGrid } from '@chakra-ui/react'
import { useMemo } from 'react'

interface LineItemType {
  item: {
    reference_origin?: string
    [key: string]: any
  }
  [key: string]: any
}

interface FontRefCounts {
  [fontRef: string]: number
}

/**
 * Count unique reference_origin values from line items
 * @param lineItems Array of line items containing item.reference_origin
 * @returns Object with reference_origin values as keys and counts as values
 */
export const getFontReferenceCounts = (
  lineItems: LineItemType[] = []
): FontRefCounts => {
  // Handle case when lineItems is undefined or not an array
  if (!Array.isArray(lineItems) || lineItems.length === 0) {
    return {}
  }

  const references = lineItems
    .filter((lineItem) => lineItem?.item?.reference_origin) // Safely check item exists
    .map((lineItem) => lineItem.item.reference_origin)
    .filter(Boolean) // Remove any undefined or null values

  return references.reduce<FontRefCounts>((acc, ref) => {
    if (typeof ref === 'string') {
      acc[ref] = (acc[ref] || 0) + 1
    }
    return acc
  }, {})
}

export const BuySummary = () => {
  const {
    order,
    isLoading,
    hasLineItems,
    selectedSkuOptions,
    hasValidLicenseType,
  } = useOrderContext()

  // Memoize font reference calculations to prevent unnecessary recalculations
  const { fontRefCounts, fontCount, parentFontString } = useMemo(() => {
    if (!order?.line_items) {
      return { fontRefCounts: {}, fontCount: 0, parentFontString: '0 fonts' }
    }

    const counts = getFontReferenceCounts(order.line_items)
    const count = Object.keys(counts).length
    const fontString = count + ' ' + (count === 1 ? 'font' : 'fonts')

    return {
      fontRefCounts: counts,
      fontCount: count,
      parentFontString: fontString,
    }
  }, [order?.line_items])

  return (
    <Show
      when={hasLineItems}
      fallback={
        <Box bg={'#FFF8D3'} px={4} py={3} borderRadius={20}>
          <Heading
            as={'h5'}
            fontSize={'xl'}
            textTransform={'uppercase'}
            fontWeight={'normal'}
            mb={1}
          >
            {'Your cart is empty'}
          </Heading>
        </Box>
      }
    >
      <Box bg={'#FFF8D3'} px={4} py={3} borderRadius={20}>
        <Heading
          as={'h5'}
          fontSize={'xl'}
          textTransform={'uppercase'}
          fontWeight={'normal'}
          mb={1}
        >
          {"What's in your cart"}
        </Heading>
        <SimpleGrid columns={3} py={3} borderTop={'1px solid #E7E0BF'} mb={1.5}>
          <Box>{parentFontString}</Box>
          <Box>
            {sizes.find(
              ({ value }) => value === order?.metadata?.license?.size?.value
            )?.label || ''}
          </Box>
          <Box></Box>
        </SimpleGrid>
        {order?.line_items?.map((lineItem) => (
          <SimpleGrid
            key={lineItem.id}
            columns={3}
            py={1.5}
            borderTop={'1px solid #E7E0BF'}
          >
            <Box>{lineItem.item?.name}</Box>
            <Box>
              {lineItem?.line_item_options
                ?.map((option) => option.name)
                .filter(Boolean)
                .join(', ')}
            </Box>
            <Box
              textAlign={'right'}
              fontVariantNumeric={'tabular-nums'}
            >{`EUR ${lineItem.unit_amount_float}`}</Box>
          </SimpleGrid>
        ))}
        <SimpleGrid columns={3} py={3} mt={1.5} borderTop={'1px solid #E7E0BF'}>
          <Box
            fontSize={'xl'}
            textTransform={'uppercase'}
            fontWeight={'normal'}
          >
            {'Total'}
          </Box>
          <Box></Box>
          <Box
            fontSize={'xl'}
            textAlign={'right'}
            fontVariantNumeric={'tabular-nums'}
          >
            {`EUR ${order?.total_amount_with_taxes_float}`}
          </Box>
        </SimpleGrid>
      </Box>
    </Show>
  )
}
