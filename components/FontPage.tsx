import React, { useState } from 'react'
import Container from 'components/BlogContainer'
import Layout from 'components/BlogLayout'
import MoreFonts from 'components/MoreFonts'
import SectionSeparator from 'components/SectionSeparator'
import * as demo from 'lib/demo.data'
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
} from '@commercelayer/react-components'

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

const LicenseSelect: React.FC<Props> = ({
  types,
  sizes,
  skuCode,
  accessToken,
}) => {
  const [selectedType, setSelectedType] = useState<Type | null>(null)
  const [selectedSize, setSelectedSize] = useState<Size | null>(null)

  const handleTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedTypeKey = event.target.value
    const selectedType = types.find((type) => type.key === selectedTypeKey)
    setSelectedType(selectedType || null)
  }

  const handleSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedSizeKey = event.target.value
    const selectedSize = sizes.find((size) => size.key === selectedSizeKey)
    setSelectedSize(selectedSize || null)
  }

  return (
    <div>
      <label htmlFor="type-select">Select a type:</label>
      <select id="type-select" onChange={handleTypeChange}>
        <option value="">--</option>
        {types.map((type) => (
          <option key={type.key} value={type.key}>
            {type.label}
          </option>
        ))}
      </select>

      <label htmlFor="size-select">Select a size:</label>
      <select id="size-select" onChange={handleSizeChange}>
        <option value="">--</option>
        {sizes.map((size) => (
          <option key={size.key} value={size.key}>
            {size.label}
          </option>
        ))}
      </select>

      <p>
        {selectedType && selectedSize && (
          <span>
            <b>
              Total price:{' '}
              {(Number(selectedType.basePrice) * selectedSize.modifier) / 100}{' '}
              EUR
            </b>
          </span>
        )}
        {selectedSize && selectedType && (
          <AddLineItemButton
            skuCode={skuCode}
            accessToken={accessToken}
            quantity={1}
            selectedSize={selectedSize?.key}
            selectedType={selectedType?.key}
          />
        )}
      </p>
    </div>
  )
}

/*

This component takes in the `types` and `sizes` data as props, and uses the `useState` hook to store the user's selected `type` and `size` in React State. The component also defines two event handlers (`handleTypeChange` and `handleSizeChange`) that update the selected `type` and `size` in State whenever the user selects a new option from the `<select>` menus.
Finally, the component renders the two `<select>` menus and displays the total price (calculated as `selectedType.basePrice * selectedSize.modifier`) whenever both a `type` and `size` have been selected.
*/

const FontVariant = ({ variant, accessToken }) => {
  return (
    <li>
      {variant.name}
      {/*
      // @TODO: default price is drawn from Sanity Data not the PricesContainer
      <PricesContainer>
        <Price skuCode={variant._id} />
      </PricesContainer>
      */}
      <LicenseSelect
        types={types}
        sizes={sizes}
        skuCode={variant._id}
        accessToken={accessToken}
      />
    </li>
  )
}

const AddToCartCustom = (props: any) => {
  const { className, label, disabled, handleClick } = props
  // const { handleAnimation } = useContext(LayoutContext)
  const customHandleClick = async (e: any) => {
    const { success } = await handleClick(e)
    console.log('AddToCartCustom:', success)
    // if (success && handleAnimation) handleAnimation(e)
  }
  return (
    <button
      disabled={disabled}
      className={className}
      onClick={customHandleClick}
    >
      {label}
    </button>
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
        <Container>
          <>
            <CommerceLayer accessToken={accessToken} endpoint={endpoint}>
              <OrderStorage persistKey={`order`}>
                <OrderContainer
                // If you need to set some of the order object attributes at the moment of the order creation, pass to the optional prop attributes to the OrderContainer component.
                // attributes={{ metadata: {} }}
                >
                  <article>
                    {font.name}
                    <ul>
                      {font.variants?.map((variant) => (
                        <FontVariant
                          key={variant._id}
                          variant={variant}
                          accessToken={accessToken}
                        />
                      ))}
                    </ul>
                    <hr />
                    <div>
                      {'Cart:'}
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
                    </div>
                    <hr />
                    <div>
                      {'Cart summary: '}
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
                    </div>
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
