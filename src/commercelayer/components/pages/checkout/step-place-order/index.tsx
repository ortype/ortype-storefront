import type { Order } from '@commercelayer/sdk'
import { useContext, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { CheckoutContext } from '@/commercelayer/providers/checkout'
// import { GTMContext } from '@/components/data/GTMProvider'
import { Errors, PlaceOrderButton } from '@/commercelayer/components'
import { Button } from '@/components/ui/chakra-button'
import { Field } from '@/components/ui/field'
import {
  Box,
  Checkbox,
  Container,
  Flex,
  Heading,
  Link,
  VStack,
} from '@chakra-ui/react'
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

  const [checked, setChecked] = useState(false)

  const checkoutCtx = useContext(CheckoutContext)
  // const gtmCtx = useContext(GTMContext)

  if (!checkoutCtx) {
    return null
  }

  const { order, placeOrder } = checkoutCtx

  const handlePlaceOrder = async ({
    placed,
    order,
  }: {
    placed: boolean
    order?: Order
  }) => {
    if (!checked) return
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
    <VStack gap={1} align={'start'}>
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

      {/* <Heading
        as={'h5'}
        fontSize={'xl'}
        textTransform={'uppercase'}
        fontWeight={'normal'}
        mb={0}
      >
        {'Terms of use'}
      </Heading>*/}

      <Box
        px={3}
        mb={1}
        fontSize={'xs'}
        textTransform={'uppercase'}
        color={'#737373'}
        asChild
      >
        <Flex gap={1} alignItems={'center'}>
          {'Terms of use'}
        </Flex>
      </Box>

      <Field h={11} px={3} mb={2} bg={'brand.50'} justifyContent={'center'}>
        <Checkbox.Root
          checked={checked}
          onCheckedChange={(e) => setChecked(!!e.checked)}
          variant={'outline'}
          size={'lg'}
        >
          <Checkbox.HiddenInput />
          <Checkbox.Control />
          <Checkbox.Label>
            I agree with Or Type's{' '}
            <Link
              href="https://assets.ortype.is/pdfs/Or-Type-EULA-2022.pdf"
              variant={'underline'}
            >
              EULA
            </Link>{' '}
            and confirm that all the information provided is truthful.
          </Checkbox.Label>
        </Checkbox.Root>
      </Field>
      <Button
        as={PlaceOrderButton}
        data-testid="save-payment-button"
        isActive={isActive}
        onClick={handlePlaceOrder}
        // disabled={!checked} // @NOTE: do not disable button, but alert user to the checkbox with a red outline
        // label={t('stepPayment.submit')}
        label={`Pay ${order?.total_amount_with_taxes_float} EUR`}
      />
    </VStack>
  )
}

export default StepPlaceOrder
