import LicenseOwnerInput from '@/commercelayer/components/forms/LicenseOwnerInput'
import { LicenseSizeList } from '@/commercelayer/components/forms/LicenseSizeList'
import { LicenseTypeList } from '@/commercelayer/components/forms/LicenseTypeList'
import { CheckoutButton } from '@/commercelayer/components/ui/checkout-button'
import { FieldsetLegend } from '@/commercelayer/components/ui/fieldset-legend'
import {
  getFontReferenceCounts,
  OrderSummary,
} from '@/commercelayer/components/ui/order-summary'
import { StickyBottomPanel } from '@/commercelayer/components/ui/sticky-bottom-panel'
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

export const Buy = () => {
  const {
    order,
    orderId,
    isLoading,
    licenseSize,
    skuOptions,
    setLicenseSize,
    deleteLineItem,
    selectedSkuOptions,
    setSelectedSkuOptions,
    allLicenseInfoSet,
    hasLineItems,
  } = useOrderContext()
  const { font, addLineItem } = useBuyContext()

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

  console.log({ displayLineItems })

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
                  {font.variants?.map((variant) => (
                    <SingleStyles
                      key={variant._id}
                      className={variant._id}
                      order={order}
                      orderId={orderId}
                      name={`${font.shortName} ${variant.optionName}`}
                      skuCode={variant._id}
                      addLineItem={addLineItem}
                      deleteLineItem={deleteLineItem}
                      licenseSize={licenseSize}
                      selectedSkuOptions={selectedSkuOptions}
                    />
                  ))}
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
                  {parentFontString} / {displayLineItems.length} {'styles'}
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

        {/*<StickyBottomPanel
          maxW={'60rem'}
          showFooter={order && hasLineItems}
          footer={() => (
            <CheckoutButton
              href={`/cart/`}
              orderId={orderId}
              isDisabled={!allLicenseInfoSet}
            />
          )}
        >
          {({ isExpanded, toggleBox }) => (
            <OrderSummary
              order={order}
              hasLineItems={hasLineItems}
              isOpen={isExpanded}
              toggleBox={toggleBox}
              heading="What's in your cart"
            />
          )}
        </StickyBottomPanel>*/}
      </Container>
      {/*<Show when={isLoading}>
        <Box pos="absolute" inset="0" bg="bg/80">
          <Center h="full">
            <Spinner color="black" size={'xl'} />
          </Center>
        </Box>
      </Show>*/}
    </>
  )
}

export default Buy
