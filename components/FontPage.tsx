import React, { useState } from 'react'
// import Container from 'components/BlogContainer'
import Layout from 'components/BlogLayout'
import MoreFonts from 'components/MoreFonts'
import SectionSeparator from 'components/SectionSeparator'
import * as demo from 'lib/demo.data'
import Select from 'react-select'
import type { Font, Settings } from 'lib/sanity.queries'
import Head from 'next/head'
import { notFound } from 'next/navigation'
import {
  CommerceLayer,
  Price,
  PricesContainer,
  OrderContainer,
  AddToCartButton,
  OrderStorage,
  // Cart
  LineItemsContainer,
  LineItemsCount,
  LineItem,
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
  createOrder,
  useCustomContext,
  OrderContext,
} from '@commercelayer/react-components'

import {
  Box,
  Container,
  Flex,
  Divider,
  Heading,
  Text,
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

const CustomContainer: React.FC<Props> = ({}) => {
  const { addToCart, orderId, getOrder, setOrderErrors } = useCustomContext({
    context: OrderContext,
    contextComponentName: 'OrderContainer',
    currentComponentName: 'AddToCartButton',
    key: 'addToCart',
  })
  return <></>
}

const LicenseSelect: React.FC<Props> = ({
  variant,
  types,
  sizes,
  skuCode,
  accessToken,
  endpoint,
}) => {
  const { order, reloadOrder } = useOrderContainer()

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
        <Text>{variant.name}</Text>
        <Text>{variant._id}</Text>
        <AddLineItemButton
          skuCode={skuCode}
          quantity={1}
          accessToken={accessToken}
          externalPrice={true}
          metadata={{
            license: {
              types: selectedTypes.map((type) => type.value),
              size: selectedSize?.value,
            },
          }}
          order={order}
          reloadOrder={reloadOrder}
        />
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

/*

This component takes in the `types` and `sizes` data as props, and uses the `useState` hook to store the user's selected `type` and `size` in React State. The component also defines two event handlers (`handleTypeChange` and `handleSizeChange`) that update the selected `type` and `size` in State whenever the user selects a new option from the `<select>` menus.
Finally, the component renders the two `<select>` menus and displays the total price (calculated as `selectedType.basePrice * selectedSize.modifier`) whenever both a `type` and `size` have been selected.
*/

const FontVariant = ({ endpoint, variant, accessToken }) => {
  return (
    <Flex direction={'column'} bg={'#EEE'} p={4}>
      {/*
      // @TODO: default price is drawn from Sanity Data not the PricesContainer
      <PricesContainer>
        <Price skuCode={variant._id} />
      </PricesContainer>
      */}
      <LicenseSelect
        variant={variant}
        types={types}
        sizes={sizes}
        skuCode={variant._id}
        accessToken={accessToken}
        endpoint={endpoint}
      />
    </Flex>
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

  return (
    <>
      <Head>
        <title>{font.name}</title>
      </Head>
      <Layout preview={preview} loading={loading}>
        <Container my={8}>
          <>
            <CommerceLayer accessToken={accessToken} endpoint={endpoint}>
              <OrderStorage persistKey={`order`}>
                <OrderContainer
                // If you need to set some of the order object attributes at the moment of the order creation, pass to the optional prop attributes to the OrderContainer component.
                // attributes={{ metadata: {} }}
                >
                  {/*<CustomContainer />*/}
                  <article>
                    <Heading>{font.name}</Heading>
                    <Stack direction={'column'}>
                      {font.variants?.map((variant) => (
                        <FontVariant
                          key={variant._id}
                          variant={variant}
                          accessToken={accessToken}
                          endpoint={endpoint}
                        />
                      ))}
                    </Stack>
                    <Box p={4}>
                      <Heading>{'Cart'}</Heading>
                      {/* @TODO: the LineItemsContainer does not reliably update when adding items manually */}
                      <LineItemsContainer>
                        <p className="your-custom-class">
                          Your shopping cart contains <LineItemsCount /> items
                        </p>
                        <LineItem>
                          {/*<LineItemImage width={50} />*/}
                          <LineItemName />
                          {/*<LineItemQuantity max={10} />*/}
                          <Errors resource="line_items" field="quantity" />
                          <LineItemAmount />
                          <LineItemRemoveLink />
                        </LineItem>
                      </LineItemsContainer>
                    </Box>
                    <Box bg={'#FFF8D3'} p={4}>
                      <Heading as={'h3'}>{'Summary: '}</Heading>
                      <div>
                        {'Subtotal: '} <SubTotalAmount />
                      </div>
                      {/*<DiscountAmount />*/}
                      {/*<ShippingAmount />*/}
                      {/*<TaxesAmount />*/}
                      {/*<GiftCardAmount />*/}
                      <div>
                        {'Total:'}
                        <TotalAmount />
                      </div>
                      <CheckoutLink label={'Checkout'} />
                    </Box>
                  </article>
                </OrderContainer>
              </OrderStorage>
            </CommerceLayer>
            <SectionSeparator />
            {/* moreFonts?.length > 0 && <MoreFonts fonts={moreFonts} /> */}
          </>
        </Container>
      </Layout>
    </>
  )
}
