import { Field } from '@/components/ui/field'
import { Box, Button, Container } from '@chakra-ui/react'
import CustomerInput from '@commercelayer/react-components/customers/CustomerInput'
import Errors from '@commercelayer/react-components/errors/Errors'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

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

  const [email, setEmail] = useState('')

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
    <Container>
      <div className="relative">
        <Field label={t('addressForm.customer_email')}>
          {readonly ? (
            <Box data-testid="current-customer-email">{emailAddress}</Box>
          ) : (
            <>
              <CustomerInput
                className="block w-full border-gray-300 form-input shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                data-testid="customer_email"
                id="customer_email"
                errorClassName="hasError"
                saveOnBlur={true}
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                onBlur={handleBlur}
                value={emailAddress}
              />
              <Button onClick={saveEmail}>Save</Button>
              <Box
                data-testid="customer_email_error"
                resource="orders"
                field="customer_email"
                messages={messages}
              />
            </>
          )}
        </Field>
      </div>
    </Container>
  )
}
