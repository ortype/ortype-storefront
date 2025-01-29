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

import { CheckoutProviderData } from '@/components/data/CheckoutProvider'
import { LINE_ITEMS_SHOPPABLE } from '@/components/utils/constants'

import { Box, Heading, SimpleGrid } from '@chakra-ui/react'
import { Size, sizes, Type, types } from '@/lib/settings'

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
    <div>
      <div data-testid="test-summary">{t('orderRecap.order_summary')}</div>
      <div>
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
      </div>
    </div>
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
    </>
  )
}
