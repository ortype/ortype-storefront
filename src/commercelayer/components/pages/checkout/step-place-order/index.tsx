import type { Order } from '@commercelayer/sdk'
import { useContext, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { CheckoutContext } from '@/commercelayer/providers/checkout'
// import { GTMContext } from '@/components/data/GTMProvider'
import { PlaceOrderButton } from '@/commercelayer/components'
import { Button } from '@/components/ui/chakra-button'
import { Box, Card, Checkbox, Field, Flex, Link } from '@chakra-ui/react'

interface Props {
  termsUrl?: string
  privacyUrl?: string
}

const StepPlaceOrder: React.FC<Props> = ({ termsUrl, privacyUrl }) => {
  const { t } = useTranslation()
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)
  const checkoutCtx = useContext(CheckoutContext)
  // const gtmCtx = useContext(GTMContext)

  const [checked, setChecked] = useState(false)
  const [invalid, setInvalid] = useState(false)

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
    if (placed) {
      setIsPlacingOrder(true)
      await placeOrder(order)
      // TODO: Re-enable GTM tracking when GTMContext is available
      // if (gtmCtx?.firePurchase && gtmCtx?.fireAddPaymentInfo) {
      //   await gtmCtx.fireAddPaymentInfo()
      //   await gtmCtx.firePurchase()
      // }
      setIsPlacingOrder(false)
    } else {
      if (!checked) {
        setInvalid(true)
      }
    }
  }

  return (
    <>
      <Box w={'full'}>
        <Field.Root invalid={invalid} gap={2}>
          <Field.Label asChild>
            <Box
              px={3}
              fontSize={'xs'}
              lineHeight={1}
              textTransform={'uppercase'}
              color={'#737373'}
              asChild
            >
              <Flex gap={1} alignItems={'center'}>
                {'Terms of use'}
              </Flex>
            </Box>
          </Field.Label>
          <Card.Root w={'full'}>
            <Card.Body
              p={3}
              css={
                invalid
                  ? {
                      // boxShadow: '1px 1px -1px 1px red',
                      bg: 'var(--or-colors-red-200)',
                    }
                  : {}
              }
            >
              {/*<Card.Title mb={2}>{'Terms of use'}</Card.Title>*/}

              <Checkbox.Root
                checked={checked}
                onCheckedChange={(e) => {
                  setChecked(!!e.checked)
                  e.checked && setInvalid(false)
                }}
                variant={'outline'}
                size={'sm'}

                // py={1}
              >
                <Checkbox.HiddenInput />
                <Checkbox.Control />
                <Checkbox.Label>
                  {"I agree with Or Type's"}{' '}
                  <Link
                    href="https://assets.ortype.is/pdfs/Or-Type-EULA-2022.pdf"
                    variant={'underline'}
                  >
                    {'Licensing Terms'}
                  </Link>{' '}
                  {'and confirm that all the information provided is truthful.'}
                </Checkbox.Label>
              </Checkbox.Root>
              <Field.ErrorText>
                {'Please check this box if you want to proceed.'}
              </Field.ErrorText>
            </Card.Body>
          </Card.Root>
        </Field.Root>
        <Flex my={4} justifyContent={'center'} alignItems={'start'} w={'full'}>
          <PlaceOrderButton
            data-testid="save-payment-button"
            onClick={handlePlaceOrder}
            termsChecked={checked}
            // disabled={!checked} // @NOTE: do not disable button, but alert user to the checkbox with a red outline
            // label={t('stepPayment.submit')}
            label={`Pay ${order?.total_amount_with_taxes_float} EUR`}
          />
        </Flex>
      </Box>
    </>
  )
}

export default StepPlaceOrder
