import { Box, Heading, SimpleGrid } from '@chakra-ui/react'
import { useOrderContext } from '@/commercelayer/providers/Order'
import {
  LineItem,
  LineItemAmount,
  LineItemName,
  LineItemOption,
  LineItemOptions,
  LineItemRemoveLink,
  LineItemsContainer,
  TotalAmount,
} from '@commercelayer/react-components'
import { sizes } from '@/lib/settings'
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
  const { order, isLoading } = useOrderContext()

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
      {/* @TODO: the LineItemsContainer does not reliably update when adding items manually */}
      <LineItemsContainer>
        <SimpleGrid
          columns={3}
          py={3}
          borderTop={'1px solid #E7E0BF'}
          borderBottom={'1px solid #E7E0BF'}
          mb={1.5}
        >
          <Box>{parentFontString}</Box>
          <Box>
            {sizes.find(
              ({ value }) => value === order?.metadata?.license?.size?.value
            )?.label || 'No size selected'}
          </Box>
          <Box></Box>
        </SimpleGrid>

        <LineItem>
          <SimpleGrid columns={3} py={1.5}>
            <LineItemName />
            <Box>
              <LineItemOptions showName showAll>
                <LineItemOption />
              </LineItemOptions>
            </Box>
            <Box textAlign={'right'}>
              <LineItemAmount />
            </Box>
          </SimpleGrid>
        </LineItem>
      </LineItemsContainer>

      <SimpleGrid columns={3} py={3} mt={1.5} borderTop={'1px solid #E7E0BF'}>
        <Box fontSize={'xl'} textTransform={'uppercase'} fontWeight={'normal'}>
          {'Total'}
        </Box>
        <Box></Box>
        <Box
          fontSize={'xl'}
          textAlign={'right'}
          fontVariantNumeric={'tabular-nums'}
        >
          <TotalAmount />
        </Box>
      </SimpleGrid>
    </Box>
  )
}
