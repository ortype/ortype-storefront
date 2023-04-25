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
                      {font.variants?.map((variant) => {
                        return (
                          <li key={variant._id}>
                            {variant.name}:
                            <PricesContainer>
                              <Price skuCode={variant._id} />
                            </PricesContainer>
                            <AddLineItemButton
                              skuCode={variant._id}
                              accessToken={accessToken}
                              quantity={1}
                            />
                          </li>
                        )
                      })}
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
