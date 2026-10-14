import { PaymentSourceBrandName } from '@commercelayer/react-components/payment_source/PaymentSourceBrandName'
import { PaymentSourceDetail } from '@commercelayer/react-components/payment_source/PaymentSourceDetail'
import { Trans, useTranslation } from 'react-i18next'

import { getTranslations } from '@/utils/payments'
import { Flex, Text } from '@chakra-ui/react'

export function PaymentSourceName(): JSX.Element {
  const { t } = useTranslation()

  return (
    <PaymentSourceBrandName>
      {(props) => {
        return props?.brand ? (
          <Text>{getTranslations(props?.brand, t)}</Text>
        ) : null
      }}
    </PaymentSourceBrandName>
  )
}

export function PaymentSourceCreditCardEndingIn(): JSX.Element {
  return (
    <Text>
      <Trans i18nKey='paymentSource.endingIn'>
        <PaymentSourceDetail type='last4' />
      </Trans>
    </Text>
  )
}

export function PaymentSourceCreditCardNumber(): JSX.Element {
  return (
    <Flex>
      <Text>
        <PaymentSourceDetail type='last4'>
          {({ text }) => {
            return <span>{text}</span>
          }}
        </PaymentSourceDetail>
      </Text>
    </Flex>
  )
}
interface PaymentSourceCreditCardExpiresProps {
  variant: 'row' | 'card'
}

export function PaymentSourceCreditCardExpires({
  variant,
}: PaymentSourceCreditCardExpiresProps): JSX.Element {
  const expiry_month = (
    <PaymentSourceDetail type='exp_month'>
      {({ text }) => <span>{text}</span>}
    </PaymentSourceDetail>
  )

  const exp_year = (
    <PaymentSourceDetail type='exp_year'>
      {({ text }) => <span>{text}</span>}
    </PaymentSourceDetail>
  )

  const label = (
    <div className='flex items-center gap-1'>
      <Trans i18nKey='paymentSource.expires' />
      <div className='flex'>
        {expiry_month}/{exp_year}
      </div>
    </div>
  )

  return variant === 'card' ? <Text>{label}</Text> : <Text>{label}</Text>
}
