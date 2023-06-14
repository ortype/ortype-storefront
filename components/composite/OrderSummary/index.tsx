import LineItemsContainer from '@commercelayer/react-components/line_items/LineItemsContainer'
import LineItemsCount from '@commercelayer/react-components/line_items/LineItemsCount'
import AdjustmentAmount from '@commercelayer/react-components/orders/AdjustmentAmount'
import DiscountAmount from '@commercelayer/react-components/orders/DiscountAmount'
import GiftCardAmount from '@commercelayer/react-components/orders/GiftCardAmount'
import PaymentMethodAmount from '@commercelayer/react-components/orders/PaymentMethodAmount'
import ShippingAmount from '@commercelayer/react-components/orders/ShippingAmount'
import SubTotalAmount from '@commercelayer/react-components/orders/SubTotalAmount'
import TaxesAmount from '@commercelayer/react-components/orders/TaxesAmount'
import TotalAmount from '@commercelayer/react-components/orders/TotalAmount'
import { Trans, useTranslation } from 'react-i18next'

import { CheckoutProviderData } from 'components/data/CheckoutProvider'
import { LINE_ITEMS_SHOPPABLE } from 'components/utils/constants'

import { Box, Heading, SimpleGrid } from '@chakra-ui/react'
import { Size, sizes, Type, types } from 'lib/settings'
import { CouponOrGiftCard } from './CouponOrGiftCard'
import { LineItemTypes } from './LineItemTypes'
import { ReturnToCart } from './ReturnToCart'
import {
  AmountSpacer,
  AmountWrapper,
  RecapLine,
  RecapLineItem,
  RecapLineItemTotal,
  RecapLineTotal,
  SummaryHeader,
  SummarySubTitle,
  SummaryTitle,
  TotalWrapper,
  Wrapper,
} from './styled'

import {
  LineItem,
  LineItemAmount,
  LineItemName,
  LineItemOption,
  LineItemOptions,
  LineItemRemoveLink,
} from '@commercelayer/react-components'

interface Props {
  checkoutCtx: CheckoutProviderData
  readonly?: boolean
}

export const OrderSummary: React.FC<Props> = ({ checkoutCtx, readonly }) => {
  const { t } = useTranslation()

  const { order } = checkoutCtx

  const isTaxCalculated = checkoutCtx.isShipmentRequired
    ? checkoutCtx.hasBillingAddress &&
      checkoutCtx.hasShippingAddress &&
      checkoutCtx.hasShippingMethod
    : checkoutCtx.hasBillingAddress

  const lineItems = !readonly ? (
    <SummaryHeader>
      <SummaryTitle data-testid="test-summary">
        {t('orderRecap.order_summary')}
      </SummaryTitle>
      <SummarySubTitle>
        <LineItemsCount
          data-testid="items-count"
          typeAccepted={LINE_ITEMS_SHOPPABLE}
        >
          {(props): JSX.Element => (
            <span data-testid="items-count">
              {t('orderRecap.cartContains', { count: props.quantity })}
            </span>
          )}
        </LineItemsCount>
      </SummarySubTitle>
    </SummaryHeader>
  ) : null
  return (
    <>
      <Box bg={'#FFF8D3'} my={4} p={4} borderRadius={20}>
        <Heading
          as={'h5'}
          fontSize={20}
          textTransform={'uppercase'}
          fontWeight={'normal'}
        >
          {'Summary'}
        </Heading>
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
                  ({ value }) => value === order?.metadata?.license?.size?.value
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
      {/*
      <Wrapper data-testid="order-summary">
        <LineItemsContainer>
          <>
            {lineItems}
            {
              <>
                {LINE_ITEMS_SHOPPABLE.map((type) => (
                  <LineItemTypes type={type} key={type} />
                ))}
              </>
            }
          </>
        </LineItemsContainer>
        <TotalWrapper>
          <AmountSpacer />
          <AmountWrapper>
            <CouponOrGiftCard
              readonly={readonly}
              setCouponOrGiftCard={checkoutCtx.setCouponOrGiftCard}
            />
            <RecapLine>
              <RecapLineItem>{t('orderRecap.subtotal_amount')}</RecapLineItem>
              <SubTotalAmount />
            </RecapLine>
            <RecapLine>
              <DiscountAmount>
                {(props) => {
                  if (props.priceCents === 0) return <></>
                  return (
                    <>
                      <RecapLineItem>
                        {t('orderRecap.discount_amount')}
                      </RecapLineItem>
                      <div data-testid="discount-amount">{props.price}</div>
                    </>
                  )
                }}
              </DiscountAmount>
            </RecapLine>
            <RecapLine>
              <AdjustmentAmount>
                {(props) => {
                  if (props.priceCents === 0) return <></>
                  return (
                    <>
                      <RecapLineItem>
                        {t('orderRecap.adjustment_amount')}
                      </RecapLineItem>
                      <div data-testid="adjustment-amount">{props.price}</div>
                    </>
                  )
                }}
              </AdjustmentAmount>
            </RecapLine>
            <RecapLine>
              <ShippingAmount>
                {(props) => {
                  if (!checkoutCtx.isShipmentRequired) return <></>
                  return (
                    <>
                      <RecapLineItem>
                        {t('orderRecap.shipping_amount')}
                      </RecapLineItem>
                      <div data-testid="shipping-amount">
                        {!checkoutCtx.hasShippingMethod
                          ? t('orderRecap.notSet')
                          : props.priceCents === 0
                          ? t('general.free')
                          : props.price}
                      </div>
                    </>
                  )
                }}
              </ShippingAmount>
            </RecapLine>
            <RecapLine data-testid="payment-method-amount">
              <PaymentMethodAmount>
                {(props) => {
                  if (props.priceCents === 0) return <></>
                  return (
                    <>
                      <RecapLineItem>
                        {t('orderRecap.payment_method_amount')}
                      </RecapLineItem>
                      {props.price}
                    </>
                  )
                }}
              </PaymentMethodAmount>
            </RecapLine>
            <RecapLine>
              <TaxesAmount>
                {(props) => {
                  return (
                    <>
                      <RecapLineItem>
                        <Trans
                          i18nKey={
                            isTaxCalculated && checkoutCtx.taxIncluded
                              ? 'orderRecap.tax_included_amount'
                              : 'orderRecap.tax_amount'
                          }
                          components={
                            isTaxCalculated
                              ? {
                                  style: (
                                    <span
                                      className={
                                        checkoutCtx.taxIncluded
                                          ? 'text-gray-500 font-normal'
                                          : ''
                                      }
                                    />
                                  ),
                                }
                              : {}
                          }
                        />
                      </RecapLineItem>
                      <div data-testid="tax-amount">
                        {isTaxCalculated ? props.price : t('orderRecap.notSet')}
                      </div>
                    </>
                  )
                }}
              </TaxesAmount>
            </RecapLine>
            <RecapLine>
              <GiftCardAmount>
                {(props) => {
                  if (props.priceCents === 0) return <></>
                  return (
                    <>
                      <RecapLineItem>
                        {t('orderRecap.giftcard_amount')}
                      </RecapLineItem>
                      <div data-testid="giftcard-amount">{props.price}</div>
                    </>
                  )
                }}
              </GiftCardAmount>
            </RecapLine>
            <RecapLineTotal>
              <RecapLineItemTotal>
                {t('orderRecap.total_amount')}
              </RecapLineItemTotal>
              <TotalAmount
                data-testid="total-amount"
                className="text-xl font-extrabold"
              />
            </RecapLineTotal>
            <ReturnToCart cartUrl={checkoutCtx.cartUrl} />
          </AmountWrapper>
        </TotalWrapper>
      </Wrapper>
      */}
    </>
  )
}
