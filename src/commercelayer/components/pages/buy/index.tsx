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
  Button,
  Center,
  Circle,
  Container,
  Fieldset,
  Flex,
  GridItem,
  Link,
  Portal,
  Show,
  SimpleGrid,
  Spinner,
  Stack,
  Text,
  VStack,
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
          sizeModifier: licenseSize?.modifier,
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

  const stylesCount = displayLineItems.length
  const licensesCount = selectedSkuOptions?.length
  const basePrice = useMemo(() => {
    if (!order?.line_items?.length || !licenseSize || !skuOptions?.length) {
      return 0
    }

    return calculateLineItemPrice({
      skuOptions: selectedSkuOptions,
      sizeModifier: licenseSize.modifier,
      count: 1,
    })
  }, [selectedSkuOptions, licenseSize, order?.line_items])

  const costWithoutDiscounts = basePrice * stylesCount
  console.log({ basePrice, stylesCount, costWithoutDiscounts })
  const discountsTotal = formatPrice(displayTotal * 100 - costWithoutDiscounts)

  // Optimistic price: compute locally so the UI updates immediately
  const unitPrice = useMemo(() => {
    if (!licenseSize || selectedSkuOptions.length === 0 || !order?.line_items) {
      return formatPrice(9000)
    }
    return formatPrice(
      calculateLineItemPrice({
        skuOptions: selectedSkuOptions,
        sizeModifier: licenseSize.modifier,
        count: fontLineItemCount,
      })
    )
  }, [selectedSkuOptions, licenseSize, order?.line_items, fontLineItemCount])

  // @TODO: on changing selected SKU options, update all line_items on the order

  return (
    <Box pos={'relative'}>
      <Box
        maxW={['100%']}
        ml={{ base: '1rem', xl: '15rem', '3xl': '21rem' }}
        mr={{
          base: '1rem',
          lg: '15rem',
          xl: '15rem',
          '2xl': '17rem',
          '3xl': '21rem',
        }}
        position={'relative'}
      >
        <SimpleGrid columns={2} gap={[4, null, null, null, null, 8]}>
          <GridItem colSpan={2}>
            <LicenseOwnerInput />
          </GridItem>
          <GridItem colSpan={{ base: 2, md: 1, '2xl': 1 }}>
            <LicenseTypeList
              font={font}
              skuOptions={skuOptions}
              selectedSkuOptions={selectedSkuOptions}
              setSelectedSkuOptions={setSelectedSkuOptions}
            />
          </GridItem>
          <GridItem colSpan={{ base: 2, md: 1, '2xl': 1 }}>
            <LicenseSizeList
              setLicenseSize={setLicenseSize}
              licenseSize={licenseSize}
            />
          </GridItem>
          <GridItem colSpan={2}>
            <Fieldset.Root>
              <FieldsetLegend>{'4. Single Styles'}</FieldsetLegend>
              <Fieldset.Content asChild p={0}>
                <Flex
                  mt={1}
                  opacity={allLicenseInfoSet ? 1 : 0.3}
                  pointerEvents={allLicenseInfoSet ? 'auto' : 'none'}
                  p={2}
                  gap={0.5}
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
                        : fontLineItemCount > 0
                        ? fontLineItemCount + 1
                        : 0

                    // fontLineItemCount is 0 if no items are added

                    return (
                      <SingleStyles
                        key={variant._id}
                        skuCode={variant._id}
                        className={variant._id}
                        selectedSkuOptions={selectedSkuOptions}
                        licenseSize={licenseSize}
                        unitPrice={unitPrice}
                        siblingCount={count}
                        parentUid={variant.parentUid}
                        addLineItem={addLineItem}
                        deleteLineItem={deleteLineItem}
                        order={order}
                        name={`${font.shortName} ${variant.optionName}`}
                      />
                    )
                  })}
                </Flex>
              </Fieldset.Content>
            </Fieldset.Root>
          </GridItem>
        </SimpleGrid>
      </Box>
      <VStack
        pos={{ base: 'relative', lg: 'fixed' }}
        right={{ base: 'auto', lg: '1rem', '3xl': '2rem' }}
        top={{ base: 'auto', lg: '7rem' }}
        w={{ base: '100%', lg: '13rem', '2xl': '15rem', '3xl': '17rem' }}
        bg={'#FFF8D3'}
        px={4}
        py={5}
        my={{ base: 4, xl: 0 }}
        borderRadius={20}
        gap={2}
      >
        <Flex
          w={'full'}
          justifyContent={'space-between'}
          borderBottom={'1px solid #CEC9AB'}
          alignItems={'center'}
          pb={2}
        >
          <Text textStyle={'md'} w={'50%'} textTransform={'uppercase'}>
            {'Added'}
          </Text>
          <Button
            asChild
            variant={'solid'}
            bg={'red'}
            borderRadius={'5rem'}
            size={'sm'}
            fontSize={'md'}
            color={'white'}
            disabled={!allLicenseInfoSet}
            gap={1}
          >
            <Link href={'/cart/'}>{'Go to cart'}</Link>
          </Button>
        </Flex>
        <Flex
          w={'full'}
          justifyContent={'space-between'}
          borderBottom={'1px solid #CEC9AB'}
          alignItems={'center'}
          pb={2}
        >
          <Text textStyle={'md'} w={'50%'}>
            {' '}
            {`Styles`}
          </Text>
          <Text pl={1} textStyle={'md'} w={'50%'}>{`${stylesCount}`}</Text>
        </Flex>
        <Flex
          w={'full'}
          justifyContent={'space-between'}
          borderBottom={'1px solid #CEC9AB'}
          alignItems={'center'}
          pb={2}
        >
          <Text textStyle={'md'} w={'50%'}>
            {' '}
            {`Licenses`}
          </Text>
          <Text pl={1} textStyle={'md'} w={'50%'}>{`${licensesCount}`}</Text>
        </Flex>
        <Flex
          w={'full'}
          justifyContent={'space-between'}
          borderBottom={'1px solid #CEC9AB'}
          alignItems={'center'}
          pb={2}
        >
          <Text textStyle={'md'} w={'50%'}>
            {' '}
            {`Unit Price`}
          </Text>
          <Text pl={1} textStyle={'md'} w={'50%'}>{`${unitPrice} EUR`}</Text>
        </Flex>
        <Flex
          w={'full'}
          justifyContent={'space-between'}
          borderBottom={'1px solid #CEC9AB'}
          alignItems={'center'}
          pb={2}
        >
          <Text textStyle={'md'} w={'50%'}>
            {' '}
            {`Discounts`}
          </Text>
          <Text
            pl={1}
            textStyle={'md'}
            w={'50%'}
          >{`${discountsTotal} EUR`}</Text>
        </Flex>
        <Flex
          w={'full'}
          mt={-1}
          justifyContent={'space-between'}
          borderTop={'1px solid #CEC9AB'}
          alignItems={'center'}
          pt={2}
        >
          <Text textStyle={'md'} w={'50%'} textTransform={'uppercase'}>
            {`TOTAL`}
          </Text>
          <Text pl={1} textStyle={'md'} w={'50%'}>{`${displayTotal} EUR`}</Text>
        </Flex>
      </VStack>
    </Box>
  )
}

export default Buy
