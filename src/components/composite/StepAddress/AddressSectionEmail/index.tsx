import CustomerInput from '@commercelayer/react-components/customers/CustomerInput'
import Errors from '@commercelayer/react-components/errors/Errors'
import { useTranslation } from 'react-i18next'
import { Box } from '@chakra-ui/react'
import { Field } from '@/components/ui/field'

interface Props {
  readonly?: boolean
  setCustomerEmail?: (email: string) => void
  emailAddress?: string
}

export const AddressSectionEmail: React.FC<Props> = ({
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
  const saveEmail = (email: string) => {
    if (setCustomerEmail) {
      setCustomerEmail(email)
      // @TODO: do we look up the customer email at this point?
    }
  }

  return (
    <Box>
      <div className="relative">
        <Field label={t('addressForm.customer_email')}>
        {readonly ? (
          <Box data-testid="current-customer-email">
            {emailAddress}
          </Box>
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
              onBlur={saveEmail}
              value={emailAddress}
            />
            <Box
              data-testid="customer_email_error"
              resource="orders"
              field="customer_email"
              messages={messages}
            />
          </>
        )}
      </div>
    </Box>
  )
}
