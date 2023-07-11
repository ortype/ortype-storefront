import {
  Box,
  Button,
  chakra,
  Container,
  Divider,
  Flex,
  forwardRef,
  Heading,
  Input,
  InputProps,
  SimpleGrid,
  Stack,
  Text,
} from '@chakra-ui/react'
import { getCustomerToken } from '@commercelayer/js-auth'
import {
  AddToCartButton,
  CheckoutLink,
  CommerceLayer as CommerceLayerContainer,
  DiscountAmount,
  Errors,
  GiftCardAmount,
  LineItem,
  LineItemAmount,
  LineItemImage,
  LineItemName,
  LineItemOption,
  LineItemOptions,
  LineItemQuantity,
  LineItemRemoveLink,
  // Cart
  LineItemsContainer,
  LineItemsCount,
  OrderContainer,
  OrderStorage,
  Price,
  PricesContainer,
  ShippingAmount,
  // Cart summary
  SubTotalAmount,
  TaxesAmount,
  TotalAmount,
  useLineItemsContainer,
  //
  useOrderContainer,
} from '@commercelayer/react-components'
import CommerceLayer, {
  LineItemUpdate,
  OrderCreate,
  OrderUpdate,
  SkuOption,
} from '@commercelayer/sdk'
import AddLineItemButton from 'components/AddLineItemButton'
// import Container from 'components/BlogContainer'
import Layout from 'components/BlogLayout'
import MoreFonts from 'components/MoreFonts'
import SectionSeparator from 'components/SectionSeparator'
import * as demo from 'lib/demo.data'
import type { Font, Settings } from 'lib/sanity.queries'
import { Size, sizes, Type, types } from 'lib/settings'
import Head from 'next/head'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import Select from 'react-select'

export interface FontPageProps {
  preview?: boolean
  loading?: boolean
  font: Font
  endpoint?: string
  accessToken?: string
  moreFonts: Font[]
  siteSettings: Settings
}

const NO_FONTS: Font[] = []

interface Props {
  types: Type[]
  sizes: Size[]
}

// @TODO: currently only called from license size handler, should we generalize this?
async function createOrUpdateOrder({
  cl,
  order,
  createOrder,
  updateOrder,
  reloadOrder,
  licenseSize,
}) {
  console.log('order: ', order)
  const localStorageOrderId = localStorage.getItem('order')
  let result
  // create a new order
  if (!order?.id && !localStorageOrderId) {
    // const resultAttrs: OrderCreate = {
    //   metadata: { license: { size: licenseSize.value } },
    // }
    // newOrder = await cl.orders.create(newOrderAttrs)

    result = await createOrder({
      persistKey: 'order',
      metadata: { license: { size: licenseSize } },
    })

    // @TODO: check if we need to manually add orderId to local storage
    // localStorage.setItem('order', newOrder.id)
    console.log('Created new order: ', order)
  } else {
    // const updateOrderAttrs: OrderUpdate = {
    //   id: order?.id || localStorageOrderId,
    //   metadata: { license: { size: licenseSize.value } },
    // }
    // newOrder = await cl.orders.update(updateOrderAttrs)

    result = await updateOrder({
      id: order?.id || localStorageOrderId,
      attributes: { metadata: { license: { size: licenseSize } } },
      // there is an `include` param
    })

    console.log('Updated order: ', result)
  }
  const reloadedOrder = await reloadOrder()
  console.log('reloadedOrder: ', reloadedOrder)
  return result.order.id
}

const CheckoutButton = ({ isDisabled, order, accessToken }) => {
  return (
    <Button
      as={Link}
      disabled={isDisabled}
      // href={`http://localhost:3002/${order?.id}?accessToken=${accessToken}`}
      href={`/checkout/${order?.id}`}
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
  addToCart,
  skuCode,
  selectedSize,
  skuOptions,
  accessToken,
  endpoint,
}) => {
  // console.log('skuCode: ', skuCode)

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

  // console.log('typeOptions: ', typeOptions, [typeOptions[0]])
  // console.log('selectedTypes: ', selectedTypes)

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

  return (
    <React.Fragment>
      <SimpleGrid columns={2} spacing={4}>
        <Stack direction={'row'} spacing={2}>
          <AddLineItemButton
            cl={cl}
            skuCode={skuCode}
            quantity={1}
            accessToken={accessToken}
            addToCart={addToCart}
            externalPrice={true}
            skuOptions={skuOptions}
            selectedSkuOptions={selectedSkuOptions}
            licenseSize={selectedSize}
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
              types: selectedSkuOptions.map((option) => option.reference),
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
  addToCart,
  reloadOrder,
  createOrder,
  updateOrder,
  skuOptions,
  accessToken,
  endpoint,
}) => {
  // *************************************
  // License size select logic
  // @TODO: consider storing the size object in metadata instead of just the value
  const [selectedSize, setSelectedSize] = useState<Size | null>(sizes[0])

  useEffect(() => {
    if (order?.metadata) {
      const initialSize = sizes.find(
        ({ value }) => value === order.metadata.license?.size?.value
      )
      setSelectedSize(initialSize)
    }
  }, [])

  console.log('selectedSize: ', selectedSize)

  const handleSizeChange = async (selectedOption: object) => {
    const selectedSize = sizes.find(
      (size) => size.value === selectedOption.value
    )
    setSelectedSize(selectedSize || null)
    // call API to set order metadata
    const updatedOrderId = await createOrUpdateOrder({
      cl,
      order,
      createOrder,
      updateOrder,
      reloadOrder,
      licenseSize: selectedSize,
    })

    // order from state is not updated within this handler so fetch a fresh copy
    let retrievedOrder
    try {
      retrievedOrder = await cl.orders.retrieve(updatedOrderId, {
        include: ['line_items'],
      })
    } catch (e) {
      console.log('retrievedOrder error: ', updatedOrderId, e)
    }

    console.log('retrievedOrder: ', retrievedOrder)

    // @TODO: check for retrievedOrder is existing
    // loop through the line_items on the order and update with new metadata
    for (const lineItem of retrievedOrder.line_items) {
      console.log('retrievedOrder lineItem: ', lineItem)
      const updateLineItemsAttrs: LineItemUpdate = {
        id: lineItem.id,
        quantity: 1,
        _external_price: true,
        metadata: {
          license: {
            size: selectedSize,
            types: lineItem.metadata?.license?.types,
          },
        },
      }
      await cl.line_items.update(updateLineItemsAttrs)
      await reloadOrder()
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
                addToCart={addToCart}
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
  const { order, reloadOrder, createOrder, updateOrder, addToCart } =
    useOrderContainer()
  console.log('order: ', order)
  useEffect(() => {
    ;(async () => {
      if (cl) {
        const options = await cl.sku_options.list()
        setSkuOptions(options)
      }
    })()

    return () => {}
  }, [cl])

  /*
  // the reloaded order does not have line_items either
  const [orderPlus, setOrderPlus] = useState({})
  console.log('orderPlus: ', orderPlus)
  useEffect(() => {
    ;(async () => {
      if (order?.updated_at) {
        const reloadedOrder = await reloadOrder()
        console.log('order changed...', order?.updated_at, reloadedOrder)
        setOrderPlus(reloadedOrder)
      }
    })()

    return () => {}
  }, [order?.updated_at])
  */

  // console.log('skuOptions: ', skuOptions)

  return (
    <article>
      <Heading>{font.name}</Heading>
      {cl && skuOptions?.length > 0 && (
        <BuyWrapper
          order={order}
          skuOptions={skuOptions}
          reloadOrder={reloadOrder}
          createOrder={createOrder}
          updateOrder={updateOrder}
          addToCart={addToCart}
          accessToken={accessToken}
          endpoint={endpoint}
          cl={cl}
          font={font}
        />
      )}
      <LineItemsCustom />
      {
        <Box bg={'#FFF8D3'} my={4} p={4} borderRadius={20}>
          <Heading
            as={'h5'}
            fontSize={20}
            textTransform={'uppercase'}
            fontWeight={'normal'}
          >
            {'Summary'}
          </Heading>
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
                    ({ value }) =>
                      value === order?.metadata?.license?.size?.value
                  )?.label
                }
              </Box>
              <Box></Box>
            </SimpleGrid>
            <LineItem>
              <SimpleGrid
                columns={3}
                spacing={4}
                borderBottom={'1px solid #EEE'}
              >
                {/*<LineItemImage width={50} />*/}
                <LineItemName />
                <Box>
                  <LineItemOptions showName showAll>
                    <LineItemOption />
                  </LineItemOptions>
                </Box>
                <Box textAlign={'right'}>
                  <LineItemAmount />
                  <Box as={LineItemRemoveLink} ml={2} />
                </Box>
                {/*<LineItemQuantity max={10} />*/}
                {/*<Errors resource="line_items" field="quantity" />*/}
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
      }
      {/*
      order?.line_items?.length > 0 && (
        <Box>
          <CheckoutButton
            // isDisabled={order?.line_items?.length === 0}
            order={order}
            accessToken={accessToken}
          />
        </Box>
      )*/}
    </article>
  )
}

export default function FontPage(props: FontPageProps) {
  const {
    cl,
    preview,
    loading,
    moreFonts = NO_FONTS,
    font,
    settings,
    endpoint,
    accessToken,
  } = props
  const { title = demo.title } = settings || {}

  const slug = font?.slug

  if (!slug && !preview) {
    notFound()
  }

  return (
    <>
      <Head>
        <title>{font.name}</title>
      </Head>
      <Layout preview={preview} loading={loading}>
        <Container my={8}>
          <OrderStorage persistKey={`order`}>
            <OrderContainer
            // attributes={{
            //   metadata: { license: { size: sizes[0] } },
            // }}
            >
              <FontWrapper
                cl={cl}
                font={font}
                accessToken={accessToken}
                endpoint={endpoint}
              />
            </OrderContainer>
          </OrderStorage>
          <SectionSeparator />
          {/* moreFonts?.length > 0 && <MoreFonts fonts={moreFonts} /> */}
        </Container>
      </Layout>
    </>
  )
}
