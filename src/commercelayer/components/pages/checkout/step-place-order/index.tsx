import type { Order } from '@commercelayer/sdk'
import { useContext, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { CheckoutContext } from '@/commercelayer/providers/checkout'
// import { GTMContext } from '@/components/data/GTMProvider'
import { Button } from '@/components/ui/chakra-button'
import { Box, Container, Flex } from '@chakra-ui/react'
import { Errors, PlaceOrderButton } from '@/commercelayer/components'
import { messages } from './messages'

interface Props {
  isActive: boolean
  termsUrl?: string
  privacyUrl?: string
}

const StepPlaceOrder: React.FC<Props> = ({
  isActive,
  termsUrl,
  privacyUrl,
}) => {
  const { t } = useTranslation()

  const [isPlacingOrder, setIsPlacingOrder] = useState(false)

  const checkoutCtx = useContext(CheckoutContext)
  // const gtmCtx = useContext(GTMContext)

  if (!checkoutCtx) {
    return null
  }

  const { placeOrder } = checkoutCtx

  const handlePlaceOrder = async ({
    placed,
    order,
  }: {
    placed: boolean
    order?: Order
  }) => {
    if (placed) {
      setIsPlacingOrder(true)
      await placeOrder(order)
      // TODO: Re-enable GTM tracking when GTMContext is available
      // if (gtmCtx?.firePurchase && gtmCtx?.fireAddPaymentInfo) {
      //   await gtmCtx.fireAddPaymentInfo()
      //   await gtmCtx.firePurchase()
      // }
      setIsPlacingOrder(false)
    }
  }

  return (
    <>
      <Container data-testid="errors-container">
        <Errors
          resource="orders"
          messages={
            messages &&
            messages.map((msg) => {
              return { ...msg, message: t(msg.message) }
            })
          }
        >
          {(props) => {
            if (props.errors?.length === 0) {
              return null
            }
            const compactedErrors = props.errors
            return (
              <>
                {compactedErrors?.map((error, index) => {
                  if (error?.trim().length === 0 || !error) {
                    return null
                  }
                  return (
                    <Box key={index}>
                      <Box>{error}</Box>
                    </Box>
                  )
                })}
              </>
            )
          }}
        </Errors>
      </Container>

      <>
        <Flex>
          <Button
            as={PlaceOrderButton}
            data-testid="save-payment-button"
            isActive={isActive}
            onClick={handlePlaceOrder}
            label={t('stepPayment.submit')}
          />
        </Flex>
      </>
    </>
  )
}

export default StepPlaceOrder
