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
import CommerceLayer from '@commercelayer/sdk'
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
  types,
  sizes,
  skuOptions,
  skuCode,
  accessToken,
  endpoint,
}) => {
  const { order, reloadOrder } = useOrderContainer()

  console.log('skuCode: ', skuCode)

  const [sku, setSku] = useState([])

  useEffect(() => {
    ;(async () => {
      if (cl) {
        const sku = await cl.skus.list({
          filters: {
            code_eq: skuCode,
          },
          include: ['sku_options'],
        })
        setSku(sku.shift())
      }
    })()

    return () => {}
  }, [cl])

  console.log('sku: ', sku)

  // @TODO: we got sku_options! Let's use them in the type select
  // @TODO: let's move the size select up to the page level and call create/update order in the
  // change handler... then we still store this value in the metadata of the line_item for price calc

  const [selectedTypes, setSelectedTypes] = useState<Type[]>([types[0]])
  const [selectedSize, setSelectedSize] = useState<Size | null>(sizes[0])

  const handleTypeChange = (selectedOptions: any) => {
    const selectedTypes = selectedOptions.map((option: any) =>
      types.find((type) => type.value === option.value)
    )
    setSelectedTypes(selectedTypes)
  }

  const handleSizeChange = (selectedOption: object) => {
    const selectedSize = sizes.find(
      (size) => size.value === selectedOption.value
    )
    setSelectedSize(selectedSize || null)
  }

  const typeOptions = types.map((type) => ({
    value: type.value,
    label: type.label,
  }))

  const sizeOptions = sizes.map((size) => ({
    value: size.value,
    label: size.label,
  }))

  return (
    <React.Fragment>
      <Stack direction={'row'}>
        <AddLineItemButton
          cl={cl}
          skuCode={skuCode}
          quantity={1}
          accessToken={accessToken}
          externalPrice={true}
          skuOptions={skuOptions}
          metadata={{
            license: {
              types: selectedTypes.map((type) => type.value),
              size: selectedSize?.value,
            },
          }}
          order={order}
          reloadOrder={reloadOrder}
        />
        <Text>{variant.name}</Text>
        {/*<Text>{variant._id}</Text>*/}
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
      </Stack>
      <Flex>
        <Select
          placeholder={'Select a type'}
          options={typeOptions}
          isMulti
          value={selectedTypes}
          onChange={handleTypeChange}
        />
        <Select
          placeholder={'Select a size'}
          options={sizeOptions}
          value={selectedSize}
          onChange={handleSizeChange}
        />
        <Flex>
          {selectedTypes.length > 0 && selectedSize && (
            <Text>
              <b>
                {' '}
                {(selectedTypes.reduce(
                  (total, type) => total + Number(type.basePrice),
                  0
                ) *
                  selectedSize.modifier) /
                  100}{' '}
                EUR
              </b>
            </Text>
          )}
        </Flex>
      </Flex>
    </React.Fragment>
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

  console.log('skuOptions: ', skuOptions)

  // @TODO: format skuOptions into label/value array for react-select
  // name = label, value = reference, basePrice = price_amount_cents (?)
  // pass down as types

  // line_item_option[0.total_amount_cents = sku_option[0].price_amount_cents

  return (
    <article>
      <Heading>{font.name}</Heading>
      <Stack direction={'column'}>
        {font.variants?.map((variant) => (
          <Flex key={variant._id} direction={'column'} bg={'#EEE'} p={4}>
            <LicenseSelect
              cl={cl}
              variant={variant}
              skuOptions={skuOptions}
              types={types}
              sizes={sizes}
              skuCode={variant._id}
              accessToken={accessToken}
              endpoint={endpoint}
            />
          </Flex>
        ))}
      </Stack>
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
