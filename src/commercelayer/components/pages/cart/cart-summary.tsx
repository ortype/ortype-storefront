import { useOrderContext } from '@/commercelayer/providers/Order'
import {
  calculateLineItemPrice,
  formatPrice,
  getLineItemPosition,
  getLineItemSibilingCount,
} from '@/commercelayer/utils/prices'
import { Box, SimpleGrid } from '@chakra-ui/react'
import { useMemo } from 'react'

const Summary = () => {
  const { order, licenseSize, skuOptions } = useOrderContext()

  // Optimistic summary: compute from each line item's sku options and position
  // The subtotal (before discount) is skuOptionsTotal * sizeModifier for each item — which is what calculateLineItemPrice computes at position 0. The discount is the difference between that and the discounted price.
  // calculateLineItemPrice with position: 0 always returns the undiscounted price (it short-circuits before any discount math).
  // So subTotalCents accumulates the full price per item, totalCents the discounted, and the difference is the total savings.
  const { subtotal, totalDiscount, total } = useMemo(() => {
    if (!order?.line_items?.length || !licenseSize || !skuOptions?.length) {
      return { subtotal: null, totalDiscount: null, total: null }
    }

    const skuLineItems = order.line_items.filter(
      (li) => li.item_type === 'skus' || li.item_type === 'bundles'
    )

    if (skuLineItems.length === 0) {
      return { subtotal: null, totalDiscount: null, total: null }
    }

    let subTotalCents = 0
    let totalCents = 0

    for (const li of skuLineItems) {
      const itemSkuOptions =
        li.line_item_options
          ?.map(({ sku_option }) =>
            skuOptions.find((o) => o.id === sku_option?.id)
          )
          .filter((o): o is NonNullable<typeof o> => !!o) ?? []

      if (itemSkuOptions.length === 0) {
        // No resolved options — use server price for both
        const amount = li.total_amount_cents ?? 0
        subTotalCents += amount
        totalCents += amount
        continue
      }

      const count = getLineItemSibilingCount(li, order.line_items!)

      // Subtotal: full price as if count 0 (no discount)
      subTotalCents += calculateLineItemPrice({
        skuOptions: itemSkuOptions,
        sizeModifier: licenseSize.modifier,
        count: 0,
      })

      // Total: actual discounted price at this count
      totalCents += calculateLineItemPrice({
        skuOptions: itemSkuOptions,
        sizeModifier: licenseSize.modifier,
        count,
      })
    }

    return {
      subtotal: formatPrice(subTotalCents),
      totalDiscount: formatPrice(subTotalCents - totalCents),
      total: formatPrice(totalCents),
    }
  }, [order?.line_items, licenseSize, skuOptions])
  const displayTotal = total ?? order?.total_amount_with_taxes_float

  return (
    <Box bg={'#FFF8D3'} px={4} py={5} borderRadius={30} w={'full'}>
      <SimpleGrid columns={2} pt={3} mt={1.5}>
        <Box fontSize={'lg'} fontWeight={'normal'}>
          {'Subtotal (excl. discounts)'}
        </Box>
        <Box
          fontSize={'lg'}
          textAlign={'right'}
          fontVariantNumeric={'tabular-nums'}
        >
          {`${subtotal} EUR`}
        </Box>
      </SimpleGrid>
      {totalDiscount && totalDiscount > 0 && (
        <SimpleGrid columns={2} pt={2} pb={2} mt={1.5}>
          <Box fontSize={'lg'} fontWeight={'normal'}>
            {'Discounts'}
          </Box>
          <Box
            fontSize={'lg'}
            textAlign={'right'}
            fontVariantNumeric={'tabular-nums'}
          >
            {`-${totalDiscount} EUR`}
          </Box>
        </SimpleGrid>
      )}
      <SimpleGrid columns={2} pt={2}>
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
