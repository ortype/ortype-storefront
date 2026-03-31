import { useOrderContext } from '@/commercelayer/providers/Order'
import {
  calculateLineItemPrice,
  formatPrice,
  getLineItemPosition,
} from '@/commercelayer/utils/prices'
import { Box, SimpleGrid } from '@chakra-ui/react'
import { useMemo } from 'react'

const Summary = () => {
  const { order, licenseSize, skuOptions } = useOrderContext()

  // Optimistic total: compute from each line item's sku options and position
  const optimisticTotal = useMemo(() => {
    if (!order?.line_items?.length || !licenseSize || !skuOptions?.length) {
      return null
    }

    const skuLineItems = order.line_items.filter(
      (li) => li.item_type === 'skus' || li.item_type === 'bundles'
    )

    if (skuLineItems.length === 0) return null

    const totalCents = skuLineItems.reduce((sum, li) => {
      // Resolve this line item's selected sku options from its line_item_options
      const itemSkuOptions = (li.line_item_options
        ?.map(({ sku_option }) =>
          skuOptions.find((o) => o.id === sku_option?.id)
        )
        .filter((o): o is NonNullable<typeof o> => !!o)) ?? []

      if (itemSkuOptions.length === 0) return sum + (li.total_amount_cents ?? 0)

      const position = getLineItemPosition(li, order.line_items!)
      return sum + calculateLineItemPrice({
        skuOptions: itemSkuOptions,
        sizeModifier: licenseSize.modifier,
        position,
      })
    }, 0)

    return formatPrice(totalCents)
  }, [order?.line_items, licenseSize, skuOptions])

  const displayTotal = optimisticTotal ?? order?.total_amount_with_taxes_float

  return (
    <Box bg={'#FFF8D3'} px={4} py={5} borderRadius={30} w={'full'}>
      <SimpleGrid columns={2} pt={3} pb={2} mt={1.5}>
        <Box fontSize={'lg'} fontWeight={'normal'}>
          {'Subtotal (excl. discounts)'}
        </Box>
        <Box
          fontSize={'lg'}
          textAlign={'right'}
          fontVariantNumeric={'tabular-nums'}
        >
          {`${displayTotal} EUR`}
        </Box>
      </SimpleGrid>
      <SimpleGrid columns={2} py={3}>
        <Box fontSize={'xl'} textTransform={'uppercase'} fontWeight={'normal'}>
          {'Total'}
        </Box>
        <Box
          fontSize={'xl'}
          textAlign={'right'}
          fontVariantNumeric={'tabular-nums'}
        >
          {`${displayTotal} EUR`}
        </Box>
      </SimpleGrid>
    </Box>
  )
}

export default Summary
