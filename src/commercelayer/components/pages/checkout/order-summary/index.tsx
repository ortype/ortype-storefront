import { useCheckoutContext } from '@/commercelayer/providers/checkout'
import { sizes } from '@/lib/settings'
import { Box, Heading, Show, SimpleGrid } from '@chakra-ui/react'
import { useMemo } from 'react'

/**
 * OrderSummary Component - Data Dependencies
 *
 * This component requires the following fields from CheckoutContext:
 * - order: Order object containing:
 *   - line_items: array of line items
 *   - line_items[].item.reference_origin: for font reference counting
 *   - line_items[].item.name: item display name
 *   - line_items[].line_item_options[].name: option names
 *   - line_items[].unit_amount_float: item pricing
 *   - metadata.license.size.value: license size for lookup in sizes map
 *   - total_amount_with_taxes_float: total order amount
 * - hasLineItems: boolean for conditional rendering
 * - isLoading: boolean for loading states (fallback UI)
 */

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

interface Props {
  readonly?: boolean
}

export const OrderSummary: React.FC<Props> = ({ readonly }) => {
  const { order, isLoading, hasLineItems } = useCheckoutContext()

  // Temporary validation logging - TODO: Remove after verification
  if (process.env.NODE_ENV !== 'production') {
    console.log('OrderSummary validation - CheckoutContext data:', {
      hasOrder: !!order,
      isLoading,
      hasLineItems,
      lineItemsCount: order?.line_items?.length || 0,
      hasMetadata: !!order?.metadata,
      hasLicenseSize: !!order?.metadata?.license?.size?.value,
      totalAmount: order?.total_amount_with_taxes_float,
      sampleLineItem: order?.line_items?.[0]
        ? {
            id: order.line_items[0].id,
            name: order.line_items[0].item?.name,
            hasReferenceOrigin: !!order.line_items[0].item?.reference_origin,
            hasOptions: !!order.line_items[0].line_item_options?.length,
            unitAmount: order.line_items[0].unit_amount_float,
          }
        : null,
    })
  }

  // Memoize line item filtering and font reference calculations
  const { displayLineItems, fontRefCounts, fontCount, parentFontString } =
    useMemo(() => {
      if (!order?.line_items) {
        return {
          displayLineItems: [],
          fontRefCounts: {},
          fontCount: 0,
          parentFontString: '0 fonts',
        }
      }

      // Filter out payment method and shipping line items - only show SKUs and bundles
      const filteredItems = order.line_items.filter(
        (lineItem) =>
          lineItem.item_type === 'skus' || lineItem.item_type === 'bundles'
      )

      const counts = getFontReferenceCounts(order.line_items)
      const count = Object.keys(counts).length
      const fontString = count + ' ' + (count === 1 ? 'font' : 'fonts')

      return {
        displayLineItems: filteredItems,
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
      <Box bg={'#FFF8D3'} mt={8} px={4} py={3} borderRadius={20} w={'full'}>
        <Heading
          as={'h5'}
          fontSize={'xl'}
          textTransform={'uppercase'}
          fontWeight={'normal'}
          mb={1}
        >
          {'Order Overview'}
        </Heading>
        <SimpleGrid
          columns={3}
          py={3}
          borderTop={'1px solid #E7E0BF'}
          borderBottom={'1px solid #E7E0BF'}
          mb={1.5}
          fontSize={'sm'}
        >
          <Box>{parentFontString}</Box>
          <Box>
            {sizes.find(
              ({ value }) => value === order?.metadata?.license?.size?.value
            )?.label || ''}
          </Box>
          <Box></Box>
        </SimpleGrid>
        {displayLineItems.map((lineItem) => (
          <SimpleGrid key={lineItem.id} columns={3} py={1.5} fontSize={'sm'}>
            <Box>{lineItem.item?.name}</Box>
            <Box>
              {
                // @TODO: these should be sorted in the same order as the 'license types' data source
                lineItem?.line_item_options
                  ?.map((option) => option.name)
                  .filter(Boolean)
                  .join(', ')
              }
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
