import LicenseOwnerInput from '@/commercelayer/components/forms/LicenseOwnerInput'
import { LicenseSizeList } from '@/commercelayer/components/forms/LicenseSizeList'
import { LicenseTypeList } from '@/commercelayer/components/forms/LicenseTypeList'
import { CheckoutButton } from '@/commercelayer/components/ui/checkout-button'
import { FieldsetLegend } from '@/commercelayer/components/ui/fieldset-legend'
import { getFontReferenceCounts } from '@/commercelayer/components/ui/order-summary'
import { useBuyContext } from '@/commercelayer/providers/buy'
import { useOrderContext } from '@/commercelayer/providers/Order'
import {
  ActionBar,
  Box,
  Center,
  Circle,
  Container,
  Fieldset,
  Flex,
  GridItem,
  Portal,
  Show,
  SimpleGrid,
  Spinner,
  Stack,
  Text,
} from '@chakra-ui/react'
import React, { useMemo } from 'react'
import { SingleStyles } from './single-styles'

import {
  calculateLineItemPrice,
  formatPrice,
  getLineItemPosition,
  getLineItemSibilingCount,
} from '@/commercelayer/utils/prices'

export const Buy = () => {
  const {
    order,
    orderId,
    licenseSize,
    skuOptions,
    setLicenseSize,
    deleteLineItem,
    selectedSkuOptions,
    setSelectedSkuOptions,
    allLicenseInfoSet,
  } = useOrderContext()
  const { font, addLineItem } = useBuyContext()

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
      const itemSkuOptions =
        li.line_item_options
          ?.map(({ sku_option }) =>
            skuOptions.find((o) => o.id === sku_option?.id)
          )
          .filter((o): o is NonNullable<typeof o> => !!o) ?? []

      if (itemSkuOptions.length === 0) return sum + (li.total_amount_cents ?? 0)

      const count = getLineItemSibilingCount(li, order.line_items!)
      return (
        sum +
        calculateLineItemPrice({
          skuOptions: itemSkuOptions,
          sizeModifier: licenseSize.modifier,
          count,
        })
      )
    }, 0)

    return formatPrice(totalCents)
  }, [order?.line_items, licenseSize, skuOptions])

  const displayTotal = optimisticTotal ?? order?.total_amount_with_taxes_float

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

  // Count how many line items already exist for this font's parentUid
  const fontLineItemCount =
    order?.line_items?.filter(
      (lineItem) => font.uid === lineItem.item?.reference_origin
    ).length ?? 0

  // @TODO: on changing selected SKU options, update all line_items on the order

  return (
    <>
      <Container maxW="60rem" position={'relative'}>
        <SimpleGrid columns={[1, null, 2]} gap={3}>
          <GridItem colSpan={2}>
            <LicenseOwnerInput />
          </GridItem>
          <GridItem>
            <LicenseTypeList
              font={font}
              skuOptions={skuOptions}
              selectedSkuOptions={selectedSkuOptions}
              setSelectedSkuOptions={setSelectedSkuOptions}
            />
          </GridItem>
          <GridItem>
            <LicenseSizeList
              setLicenseSize={setLicenseSize}
              licenseSize={licenseSize}
            />
          </GridItem>
          <GridItem colSpan={2}>
            <Fieldset.Root>
              <FieldsetLegend>{'4. Single Styles'}</FieldsetLegend>
              <Fieldset.Content asChild>
                <Flex
                  mt={1}
                  opacity={allLicenseInfoSet ? 1 : 0.3}
                  pointerEvents={allLicenseInfoSet ? 'auto' : 'none'}
                  bg={'#EEE'}
                  p={2}
                  gap={2}
                >
                  {font.variants?.map((variant, index) => {
                    // If this variant is already a line item, use its real position;
                    // otherwise it would be added at the end of the group
                    const existingLineItem = order?.line_items?.find(
                      (li) => li.sku_code === variant._id
                    )
                    const count =
                      existingLineItem && order?.line_items
                        ? getLineItemSibilingCount(
                            existingLineItem,
                            order.line_items
                          )
                        : fontLineItemCount

                    return (
                      <SingleStyles
                        key={variant._id}
                        skuCode={variant._id}
                        className={variant._id}
                        selectedSkuOptions={selectedSkuOptions}
                        licenseSize={licenseSize}
                        siblingCount={count}
                        parentUid={variant.parentUid}
                        addLineItem={addLineItem}
                        deleteLineItem={deleteLineItem}
                        order={order}
                        orderId={orderId}
                        name={`${font.shortName} ${variant.optionName}`}
                      />
                    )
                  })}
                </Flex>
              </Fieldset.Content>
            </Fieldset.Root>
          </GridItem>
        </SimpleGrid>
        <ActionBar.Root open={allLicenseInfoSet}>
          <Portal>
            <ActionBar.Positioner>
              <ActionBar.Content>
                <Text textStyle={'md'} pl={2} whiteSpace={'nowrap'}>
                  {`${displayTotal} EUR`}
                </Text>

                <ActionBar.Separator />
                <CheckoutButton
                  href={`/cart/`}
                  orderId={orderId}
                  isDisabled={!allLicenseInfoSet}
                />
              </ActionBar.Content>
            </ActionBar.Positioner>
          </Portal>
        </ActionBar.Root>
      </Container>
    </>
  )
}

export default Buy
