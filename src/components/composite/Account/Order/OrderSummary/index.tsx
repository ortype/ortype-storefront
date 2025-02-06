import { Box, Flex, Text } from '@chakra-ui/react'
import { DiscountAmount } from '@commercelayer/react-components/orders/DiscountAmount'
import { GiftCardAmount } from '@commercelayer/react-components/orders/GiftCardAmount'
import { PaymentMethodAmount } from '@commercelayer/react-components/orders/PaymentMethodAmount'
import { ShippingAmount } from '@commercelayer/react-components/orders/ShippingAmount'
import { SubTotalAmount } from '@commercelayer/react-components/orders/SubTotalAmount'
import { TaxesAmount } from '@commercelayer/react-components/orders/TaxesAmount'
import { TotalAmount } from '@commercelayer/react-components/orders/TotalAmount'
import { useTranslation } from 'react-i18next'

function OrderSummary(): JSX.Element {
  const { t } = useTranslation()

  return (
    <Flex direction={'row'} py={6}>
      <Flex direction={'column'}>
        <Flex direction={'row'} justifyContent={'space-between'}>
          <Box>{t('order.summary.subtotal_amount')}</Box>
          <SubTotalAmount />
        </Flex>
        <Flex direction={'row'} justifyContent={'space-between'}>
          <DiscountAmount>
            {(props) => {
              if (props.priceCents === 0) return <></>
              return (
                <>
                  <Box>{t('order.summary.discount_amount')}</Box>
                  <div>{props.price}</div>
                </>
              )
            }}
          </DiscountAmount>
        </Flex>
        <Flex direction={'row'} justifyContent={'space-between'}>
          <Box>{t('order.summary.shipping_amount')}</Box>
          <ShippingAmount />
        </Flex>
        <Flex direction={'row'} justifyContent={'space-between'}>
          <PaymentMethodAmount>
            {(props) => {
              if (props.priceCents === 0) return <></>
              return (
                <>
                  <Box>{t('order.summary.payment_method_amount')}</Box>
                  {props.price}
                </>
              )
            }}
          </PaymentMethodAmount>
        </Flex>
        <Flex direction={'row'} justifyContent={'space-between'}>
          <Box>{t('order.summary.tax_amount')}</Box>
          <TaxesAmount />
        </Flex>
        <Flex direction={'row'} justifyContent={'space-between'}>
          <GiftCardAmount>
            {(props) => {
              if (props.priceCents === 0) return <></>
              return (
                <>
                  <Box>{t('order.summary.giftcard_amount')}</Box>
                  <div>{props.price}</div>
                </>
              )
            }}
          </GiftCardAmount>
        </Flex>
        <Box>
          <Text>{t('order.summary.total_amount')}</Text>
          <TotalAmount className="font-extrabold" />
        </Box>
      </Flex>
    </Flex>
  )
}

export default OrderSummary
