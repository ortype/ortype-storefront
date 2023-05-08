import React, { useState, useEffect } from 'react'
// import Container from 'components/BlogContainer'
import Layout from 'components/BlogLayout'
import MoreFonts from 'components/MoreFonts'
import SectionSeparator from 'components/SectionSeparator'
import * as demo from 'lib/demo.data'
import Select from 'react-select'
import type { Font, Settings } from 'lib/sanity.queries'
import Head from 'next/head'
import { notFound } from 'next/navigation'
import CommerceLayer, {
  OrderCreate,
  OrderUpdate,
  SkuOption,
  LineItemUpdate,
} from '@commercelayer/sdk'
import {
  CommerceLayer as CommerceLayerContainer,
  Price,
  PricesContainer,
  OrderContainer,
  AddToCartButton,
  OrderStorage,
  // Cart
  LineItemsContainer,
  LineItemsCount,
  LineItem,
  LineItemOptions,
  LineItemOption,
  LineItemImage,
  LineItemName,
  LineItemQuantity,
  LineItemAmount,
  LineItemRemoveLink,
  Errors,
  // Cart summary
  SubTotalAmount,
  DiscountAmount,
  ShippingAmount,
  TaxesAmount,
  GiftCardAmount,
  TotalAmount,
  CheckoutLink,
  //
  useOrderContainer,
  useLineItemsContainer,
} from '@commercelayer/react-components'

import {
  Box,
  Container,
  Flex,
  SimpleGrid,
  Divider,
  Heading,
  Text,
  Button,
  Link,
  Stack,
} from '@chakra-ui/react'

import AddLineItemButton from 'components/AddLineItemButton'
import { Type, Size, types, sizes } from 'lib/settings'

export interface FontPageProps {
  preview?: boolean
  loading?: boolean
  font: Font
  endpoint?: string
  accessToken?: string
  moreFonts: Font[]
  settings: Settings
}

const NO_FONTS: Font[] = []

interface Props {
  types: Type[]
  sizes: Size[]
}

// @TODO: currently only called from license size handler, should we generalize this?
async function createOrUpdateOrder({ cl, order, reloadOrder, licenseSize }) {
  const localStorageOrderId = localStorage.getItem('order')
  let newOrder
  if (!order?.id && !localStorageOrderId) {
    const newOrderAttrs: OrderCreate = {
      metadata: { license: { size: licenseSize.value } },
    }
    newOrder = await cl.orders.create(newOrderAttrs)
    // @TODO: check if we need to manually add orderId to local storage
    localStorage.setItem('order', newOrder.id)
    console.log('Created new order: ', newOrderAttrs, newOrder.id, order)
  } else {
    const updateOrderAttrs: OrderUpdate = {
      id: order?.id || localStorageOrderId,
      metadata: { license: { size: licenseSize.value } },
    }
    newOrder = await cl.orders.update(updateOrderAttrs)
    console.log('Updated order: ', updateOrderAttrs, newOrder.id, newOrder)
  }
  reloadOrder()
  return newOrder
}

const CheckoutButton = ({ order, accessToken }) => {
  return (
    <Button
      as={Link}
      href={`http://localhost:3001/${order?.id}?accessToken=${accessToken}`}
    >
      {'Checkout'}
    </Button>
  )
}

const LineItemsCustom = () => {
  const { lineItems } = useLineItemsContainer()
  console.log('lineItems: ', lineItems)
  return <div />
}

/*
This component takes in the `types` and `sizes` data as props, and uses the `useState` hook to store the user's selected `type` and `size` in React State. The component also defines two event handlers (`handleTypeChange` and `handleSizeChange`) that update the selected `type` and `size` in State whenever the user selects a new option from the `<select>` menus.
Finally, the component renders the two `<select>` menus and displays the total price (calculated as `selectedType.basePrice * selectedSize.modifier`) whenever both a `type` and `size` have been selected.
*/

const LicenseSelect: React.FC<Props> = ({
  variant,
  cl,
  order,
  reloadOrder,
  skuCode,
  selectedSize,
  skuOptions,
  accessToken,
  endpoint,
}) => {
  console.log('skuCode: ', skuCode)

  /*
  const [skuOptions, setSkuOptions] = useState([{}])

  useEffect(() => {
    ;(async () => {
      if (cl) {
        const sku = await cl.skus.list({
          filters: {
            code_eq: skuCode,
          },
          include: ['sku_options'],
        })
        setSkuOptions(
          sku[0]?.sku_options.sort(
            (a, b) =>
              parseInt(a.reference.charAt(0)) - parseInt(b.reference.charAt(0))
          )
        )
      }
    })()

    return () => {}
  }, [cl, order])
*/

  // console.log('skuOptions: ', skuOptions)

  // @TODO: format skuOptions into label/value array for react-select
  // name = label, value = reference, basePrice = price_amount_cents (?)
  // pass down as types

  // line_item_option[0.total_amount_cents = sku_option[0].price_amount_cents

  // @TODO: we got sku_options! Let's use them in the type select
  // @TODO: let's move the size select up to the page level and call create/update order in the
  // change handler... then we still store this value in the metadata of the line_item for price calc

  const typeOptions = skuOptions
    .sort(
      (a, b) =>
        parseInt(a.reference.charAt(0)) - parseInt(b.reference.charAt(0))
    )
    ?.map(
      ({ reference: value, name: label, price_amount_cents: basePrice }) => ({
        value,
        label,
        basePrice,
      })
    )

  const [selectedTypes, setSelectedTypes] = useState<Type[]>([typeOptions[0]])
  const [selectedSkuOptions, setSelectedSkuOptions] = useState<SkuOption[]>([
    skuOptions[0],
  ])

  console.log('typeOptions: ', typeOptions, [typeOptions[0]])
  console.log('selectedTypes: ', selectedTypes)

  const handleTypeChange = (selectedOptions: any) => {
    console.log('selectedOptions: ', selectedOptions)
    // @TODO: review this logic
    // this is only interesting if we want to select skuOptions
    const selectedSkuOptions = selectedOptions.map((option: any) =>
      skuOptions.find((type) => type.reference === option.value)
    )
    setSelectedSkuOptions(selectedSkuOptions)
    setSelectedTypes(selectedOptions)
  }

  // 1. update line item with new metadata
  // 2. loop through `selectedSkuOptions` and update or create
  // ...actually, this functionality is in a little bit of a different scope
  // consider first splitting up the "Buy" and "Cart" design before continuing

  console.log('selectedSkuOptions: ', selectedSkuOptions)

  return (
    <React.Fragment>
      <SimpleGrid columns={2} spacing={4}>
        <Stack direction={'row'} spacing={2}>
          <AddLineItemButton
            cl={cl}
            skuCode={skuCode}
            quantity={1}
            accessToken={accessToken}
            externalPrice={true}
            skuOptions={skuOptions}
            selectedSkuOptions={selectedSkuOptions}
            licenseSize={selectedSize?.value}
            order={order}
            reloadOrder={reloadOrder}
          />
          <Text>{variant.name}</Text>
        </Stack>
        {/*<AddToCartButton
          skuCode={skuCode}
          quantity={1}
          externalPrice={true}
          metadata={{
            license: {
              types: selectedTypes.map((type) => type.value),
              size: selectedSize?.value,
            },
          }}
        />*/}
        <Stack direction={'row'} spacing={2}>
          <Select
            placeholder={'Select a type'}
            options={typeOptions}
            isMulti
            value={selectedTypes}
            onChange={handleTypeChange}
          />
          <Flex>
            {selectedSkuOptions.length > 0 && selectedSize && (
              <Text>
                <b>
                  {' '}
                  {(selectedSkuOptions.reduce(
                    (total, { price_amount_cents }) =>
                      total + Number(price_amount_cents),
                    0
                  ) *
                    selectedSize.modifier) /
                    100}{' '}
                  EUR
                </b>
              </Text>
            )}
          </Flex>
        </Stack>
      </SimpleGrid>
    </React.Fragment>
  )
}

const BuyWrapper: React.FC<Props> = ({
  font,
  cl,
  order,
  reloadOrder,
  skuOptions,
  accessToken,
  endpoint,
}) => {
  // *************************************
  // License size select logic
  // @TODO: consider storing the size object in metadata instead of just the value

  const initialSize = sizes.find(
    ({ value }) => value === order?.metadata?.license?.size
  )
  const [selectedSize, setSelectedSize] = useState<Size | null>(initialSize)

  const handleSizeChange = async (selectedOption: object) => {
    const selectedSize = sizes.find(
      (size) => size.value === selectedOption.value
    )
    setSelectedSize(selectedSize || null)
    // call API to set order metadata
    const updatedOrder = await createOrUpdateOrder({
      cl,
      order,
      reloadOrder,
      licenseSize: selectedSize,
    })

    // order from state is not updated within this handler so fetch a fresh copy
    const retrievedOrder = await cl.orders.retrieve(updatedOrder.id, {
      include: ['line_items'],
    })

    // loop through the line_items on the order and update with new metadata
    for (const lineItem of retrievedOrder.line_items) {
      console.log('retrievedOrder lineItem: ', lineItem)
      const updateLineItemsAttrs: LineItemUpdate = {
        id: lineItem.id,
        quantity: 1,
        _external_price: true,
        metadata: {
          license: {
            size: selectedSize.value,
            types: lineItem.metadata?.license?.types,
          },
        },
      }
      await cl.line_items.update(updateLineItemsAttrs)
      reloadOrder()
    }
  }

  const sizeOptions = sizes.map((size) => ({
    value: size.value,
    label: size.label,
  }))

  // *************************************

  return (
    <>
      <Select
        placeholder={'Select a size'}
        options={sizeOptions}
        value={selectedSize}
        onChange={handleSizeChange}
      />
      <Stack direction={'column'}>
        {font.variants?.map((variant) => (
          <Flex key={variant._id} direction={'column'} bg={'#EEE'} p={4}>
            {skuOptions && (
              <LicenseSelect
                cl={cl}
                order={order}
                selectedSize={selectedSize}
                reloadOrder={reloadOrder}
                variant={variant}
                skuOptions={skuOptions}
                skuCode={variant._id}
                accessToken={accessToken}
                endpoint={endpoint}
              />
            )}
          </Flex>
        ))}
      </Stack>
    </>
  )
}

const FontWrapper = ({ cl, font, accessToken, endpoint }) => {
  const [skuOptions, setSkuOptions] = useState([])
  const { order, reloadOrder } = useOrderContainer()
  console.log('order: ', order)
  console.log(accessToken)
  useEffect(() => {
    ;(async () => {
      if (cl) {
        const options = await cl.sku_options.list()
        setSkuOptions(options)
      }
    })()

    return () => {}
  }, [cl])

  // console.log('skuOptions: ', skuOptions)

  return (
    <article>
      <Heading>{font.name}</Heading>
      {order && (
        <BuyWrapper
          order={order}
          skuOptions={skuOptions}
          reloadOrder={reloadOrder}
          accessToken={accessToken}
          endpoint={endpoint}
          cl={cl}
          font={font}
        />
      )}
      <Box bg={'#FFF8D3'} my={4} p={4} borderRadius={20}>
        <Heading
          as={'h5'}
          fontSize={20}
          textTransform={'uppercase'}
          fontWeight={'normal'}
        >
          {'Summary'}
        </Heading>
        <LineItemsCustom />
        {/* @TODO: the LineItemsContainer does not reliably update when adding items manually */}
        <LineItemsContainer>
          <SimpleGrid
            columns={3}
            spacing={4}
            borderTop={'1px solid #EEE'}
            borderBottom={'1px solid #EEE'}
          >
            <Box></Box>
            <Box>
              {
                sizes.find(
                  ({ value }) => value === order?.metadata?.license?.size
                )?.label
              }
            </Box>
            <Box></Box>
          </SimpleGrid>
          <LineItem>
            <SimpleGrid columns={3} spacing={4} borderBottom={'1px solid #EEE'}>
              {/*<LineItemImage width={50} />*/}
              <LineItemName />
              <Box>
                <LineItemOptions showName showAll>
                  <LineItemOption />
                </LineItemOptions>
              </Box>
              <Box textAlign={'right'}>
                <LineItemAmount />
              </Box>
              {/*<LineItemQuantity max={10} />*/}
              {/*<Errors resource="line_items" field="quantity" />*/}
              {/*<LineItemRemoveLink />*/}
            </SimpleGrid>
          </LineItem>
        </LineItemsContainer>
        <SimpleGrid columns={3} spacing={4}>
          <Box
            fontSize={20}
            textTransform={'uppercase'}
            fontWeight={'normal'}
            textDecoration={'underline'}
          >
            {'Total'}
          </Box>
          <Box></Box>
          <Box textAlign={'right'}>
            <TotalAmount />
          </Box>
        </SimpleGrid>
      </Box>
      <Box>
        <CheckoutButton order={order} accessToken={accessToken}>
          {'Checkout'}
        </CheckoutButton>
        {/*
          // @TODO: Also this one is not working
          <CheckoutLink label={'Checkout'} />*/}
      </Box>
    </article>
  )
}

export default function FontPage(props: FontPageProps) {
  const {
    preview,
    loading,
    moreFonts = NO_FONTS,
    font,
    endpoint,
    settings,
    accessToken,
  } = props
  const { title = demo.title } = settings || {}

  const slug = font?.slug

  if (!slug && !preview) {
    notFound()
  }

  let cl
  if (accessToken) {
    cl = CommerceLayer({
      organization: 'or-type-mvp',
      accessToken,
    })
  }

  return (
    <>
      <Head>
        <title>{font.name}</title>
      </Head>
      <Layout preview={preview} loading={loading}>
        <Container my={8}>
          <CommerceLayerContainer accessToken={accessToken} endpoint={endpoint}>
            <OrderStorage persistKey={`order`}>
              <OrderContainer
                // If you need to set some of the order object attributes at the moment of the order creation, pass to the optional prop attributes to the OrderContainer component.
                // attributes={{ metadata: {} }}
                attributes={{
                  checkout_url: 'http://localhost:3001/:order_id', // @TODO: this isn't working as initially expected
                }}
              >
                <FontWrapper
                  cl={cl}
                  font={font}
                  accessToken={accessToken}
                  endpoint={endpoint}
                />
              </OrderContainer>
            </OrderStorage>
          </CommerceLayerContainer>
          <SectionSeparator />
          {/* moreFonts?.length > 0 && <MoreFonts fonts={moreFonts} /> */}
        </Container>
      </Layout>
    </>
  )
}
