import type { Order } from '@commercelayer/sdk'
import { useContext, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { CheckoutContext } from '@/commercelayer/providers/checkout'
// import { GTMContext } from '@/components/data/GTMProvider'
import { PlaceOrderButton } from '@/commercelayer/components'
import { Button } from '@/components/ui/chakra-button'
import { Field } from '@/components/ui/field'
import { Checkbox, Flex, Link } from '@chakra-ui/react'

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
    <Flex justifyContent={'space-between'} alignItems={'start'} w={'full'}>
      {/* <Heading
        as={'h5'}
        fontSize={'xl'}
        textTransform={'uppercase'}
        fontWeight={'normal'}
        mb={0}
      >
        {'Terms of use'}
      </Heading>*/}

      {/*<Box
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
      </Box>*/}

      <Checkbox.Root
        checked={checked}
        onCheckedChange={(e) => setChecked(!!e.checked)}
        variant={'outline'}
        size={'sm'}
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
          {/*and confirm that all the information provided is truthful.*/}
        </Checkbox.Label>
      </Checkbox.Root>
      {/*<Field h={11} px={3} mb={2} bg={'brand.50'} justifyContent={'center'}>
      </Field>*/}
      <Button
        as={PlaceOrderButton}
        data-testid="save-payment-button"
        isActive={isActive}
        onClick={handlePlaceOrder}
        gap={1}
        // disabled={!checked} // @NOTE: do not disable button, but alert user to the checkbox with a red outline
        // label={t('stepPayment.submit')}
        label={`Pay ${order?.total_amount_with_taxes_float} EUR`}
      />
    </Flex>
  )
}

export default StepPlaceOrder
