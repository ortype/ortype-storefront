import LicenseOwnerInput from '@/commercelayer/components/forms/LicenseOwnerInput'
import { LicenseSizeList } from '@/commercelayer/components/forms/LicenseSizeList'
import { LicenseTypeList } from '@/commercelayer/components/forms/LicenseTypeList'
import { FieldsetLegend } from '@/commercelayer/components/ui/fieldset-legend'
import { getFontReferenceCounts } from '@/commercelayer/components/ui/order-summary'
import { useBuyContext } from '@/commercelayer/providers/buy'
import { useOrderContext } from '@/commercelayer/providers/Order'
import {
  calculateDiscount,
  calculateLineItemPrice,
  formatPrice,
  getLineItemSibilingCount,
} from '@/commercelayer/utils/prices'
import {
  Box,
  Button,
  Link as ChakraLink,
  Fieldset,
  Flex,
  GridItem,
  Show,
  SimpleGrid,
  Text,
  VStack,
} from '@chakra-ui/react'
import Link from 'next/link'
import React, { useMemo } from 'react'
import Typefaces from './typefaces'

interface FontVariant {
  _id: string
  optionName: string
  parentUid: string
}

interface FontGroup {
  _type: string
  groupName: string
  variants: FontVariant[]
  italicVariants: FontVariant[]
}

interface FontGroupWithMerged extends FontGroup {
  allVariants: FontVariant[]
}

export const Buy = () => {
  const {
    order,
    orderId,
    licenseSize,
    skuOptions,
    setLicenseSize,
    selectedSkuOptions,
    setSelectedSkuOptions,
    allLicenseInfoSet,
  } = useOrderContext()
  const { font, selectedSkus, summary } = useBuyContext()

  /*
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

  const displayTotal = optimisticTotal ?? order?.total_amount_with_taxes_float*/

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

  const licensesCount = selectedSkuOptions?.length

  // All pricing now derived from the selection buffer via BuyProvider
  const {
    show,
    fontStyleCount: fontLineItemCount,
    unitPrice,
    nextUnitPrice,
    subtotal,
    percentageDiscount,
    totalDiscount,
    total,
  } = summary

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
        <SimpleGrid columns={2} gap={[4, null, null, null, null, null, 8]}>
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
            <Text
              as={Box}
              py={4}
              textAlign={'center'}
              textStyle={'xs'}
              opacity={0.8}
            >
              {`Need something else? Please `}
              <ChakraLink
                href="mailto:info@ortype.is"
                textDecoration={'underline'}
                target={'_blank'}
              >
                {'contact us'}
              </ChakraLink>
              {`.`}
            </Text>
          </GridItem>
          <GridItem colSpan={{ base: 2, md: 1, '2xl': 1 }}>
            <LicenseSizeList
              setLicenseSize={setLicenseSize}
              licenseSize={licenseSize}
            />
          </GridItem>
          <GridItem colSpan={2}>
            <Fieldset.Root>
              <FieldsetLegend>{'4. Typefaces'}</FieldsetLegend>
              <Fieldset.Content
                asChild
                p={0}
                pointerEvents={allLicenseInfoSet ? 'auto' : 'none'}
                opacity={allLicenseInfoSet ? 1 : 0.3}
              >
                <Typefaces />
              </Fieldset.Content>
            </Fieldset.Root>
          </GridItem>
        </SimpleGrid>
      </Box>
      <Show when={show}>
        <VStack
          pos={{ base: 'relative', lg: 'fixed' }}
          right={{ base: 'auto', lg: '1rem', '3xl': '2rem' }}
          top={{ base: 'auto', lg: 5 }}
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
            <Text
              textStyle={{ base: 'md', xl: 'sm', '2xl': 'md' }}
              w={'50%'}
              textTransform={'uppercase'}
            >
              {'Summary'}
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
              _hover={{ bg: 'black' }}
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
            <Text textStyle={{ base: 'md', xl: 'sm', '2xl': 'md' }} w={'50%'}>
              {' '}
              {`Styles`}
            </Text>
            <Text
              pl={1}
              textStyle={{ base: 'md', xl: 'sm', '2xl': 'md' }}
            >{`${fontLineItemCount}`}</Text>
          </Flex>
          <Flex
            w={'full'}
            justifyContent={'space-between'}
            borderBottom={'1px solid #CEC9AB'}
            alignItems={'center'}
            pb={2}
          >
            <Text textStyle={{ base: 'md', xl: 'sm', '2xl': 'md' }} w={'50%'}>
              {' '}
              {`Licenses`}
            </Text>
            <Text
              pl={1}
              textStyle={{ base: 'md', xl: 'sm', '2xl': 'md' }}
            >{`${licensesCount}`}</Text>
          </Flex>
          <Flex
            w={'full'}
            justifyContent={'space-between'}
            borderBottom={'1px solid #CEC9AB'}
            alignItems={'center'}
            pb={2}
          >
            <Text textStyle={{ base: 'md', xl: 'sm', '2xl': 'md' }} w={'50%'}>
              {' '}
              {`Unit Price`}
            </Text>
            <Text
              pl={1}
              textStyle={{ base: 'md', xl: 'sm', '2xl': 'md' }}
            >{`${unitPrice} EUR`}</Text>
          </Flex>
          <Flex
            w={'full'}
            justifyContent={'space-between'}
            borderBottom={'1px solid #CEC9AB'}
            alignItems={'center'}
            pb={2}
          >
            <Text textStyle={{ base: 'md', xl: 'sm', '2xl': 'md' }} w={'50%'}>
              {' '}
              {`Subtotal`}
            </Text>
            <Text
              pl={1}
              textStyle={{ base: 'md', xl: 'sm', '2xl': 'md' }}
            >{`${subtotal} EUR`}</Text>
          </Flex>
          <Show when={totalDiscount > 0}>
            <Flex
              w={'full'}
              justifyContent={'space-between'}
              borderBottom={'1px solid #CEC9AB'}
              alignItems={'center'}
              pb={2}
            >
              <Text
                textStyle={{ base: 'md', xl: 'sm', '2xl': 'md' }}
                w={'50%'}
                whiteSpace={'nowrap'}
              >
                {`Discount (${percentageDiscount * 100}%)`}
              </Text>
              <Text
                pl={1}
                textStyle={{ base: 'md', xl: 'sm', '2xl': 'md' }}
              >{`-${totalDiscount} EUR`}</Text>
            </Flex>
          </Show>
          <Flex
            w={'full'}
            mt={-1}
            justifyContent={'space-between'}
            borderTop={'1px solid #CEC9AB'}
            alignItems={'center'}
            pt={2}
          >
            <Text
              textStyle={{ base: 'md', xl: 'sm', '2xl': 'md' }}
              w={'50%'}
              textTransform={'uppercase'}
            >
              {`TOTAL`}
            </Text>
            <Text pl={1} textStyle={'md'}>{`${total} EUR`}</Text>
          </Flex>
        </VStack>
      </Show>
    </Box>
  )
}

export default Buy
