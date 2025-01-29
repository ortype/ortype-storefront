import { Field } from '@/components/ui/field'
import { Button, Input } from '@chakra-ui/react'
import CustomerInput from '@commercelayer/react-components/customers/CustomerInput'
import Errors from '@commercelayer/react-components/errors/Errors'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

// @TODO: switch to chakra-ui components
// with react-hook-form and yup validation

interface Props {
  readonly?: boolean
  setCustomerEmail?: (email: string) => void
  emailAddress?: string
}

export const Email: React.FC<Props> = ({
  readonly,
  setCustomerEmail,
  emailAddress,
}) => {
  const { t } = useTranslation()

  const [email, setEmail] = useState('')

  const messages: Parameters<typeof Errors>[0]['messages'] = [
    {
      code: 'EMPTY_ERROR',
      resource: 'orders',
      field: 'customer_email',
      message: t('input.cantBlank'),
    },
    {
      code: 'VALIDATION_ERROR',
      resource: 'orders',
      field: 'customer_email',
      message: t('input.mustBeValidEmail'),
    },
  ]

  const handleBlur = (value) => {
    // the event.target.value has been validated by CustomerInput handlers
    // @WARNING: wrapping `CustomerInput` in a chakra input breaks the component
    console.log('StepEmail/Email: handleBlur: ', value)
    setEmail && setEmail(value)
  }

  const saveEmail = () => {
    if (setCustomerEmail && email.length > 0) {
      setCustomerEmail(email)
    }
  }

  return (
    <div>
      <div className="relative">
        <Input asChild variant={'subtle'} size={'xl'}>
          <CustomerInput
            data-testid="customer_email"
            id="customer_email"
            errorClassName="hasError"
            // @NOTE: `onBlur` requires `saveOnBlur === true`
            saveOnBlur={true}
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            onBlur={handleBlur}
            value={emailAddress}
          />
        </Input>
        <Field label={t('addressForm.customer_email')} invalid={false}></Field>
        <Button onClick={saveEmail}>Save</Button>
        <Errors
          data-testid="customer_email_error"
          resource="orders"
          field="customer_email"
          messages={messages}
        />
        {readonly ? (
          <Input
            disabled
            data-testid="current-customer-email"
            value={emailAddress}
          />
        ) : (
          <></>
        )}
      </div>
    </div>
  )
}
