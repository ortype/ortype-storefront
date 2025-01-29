import PaymentMethod from '@commercelayer/react-components/payment_methods/PaymentMethod'
import PaymentSource, {
  CustomerSaveToWalletProps,
} from '@commercelayer/react-components/payment_source/PaymentSource'
import { MouseEvent, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { PaymentDetails } from './PaymentDetails'
import { PaymentSkeleton } from './PaymentSkeleton'
import { PaymentSummaryList } from './PaymentSummaryList'

import { Checkbox } from '@/components/ui/checkbox'
import { Field } from '@/components/ui/field'
import { Box, Container } from '@chakra-ui/react'

interface Props {
  selectPayment: any
  hasTitle: boolean
  autoSelectCallback: () => void
}

type TTemplateCustomerCards = Parameters<
  typeof PaymentSource
>[0]['templateCustomerCards']

export const CheckoutCustomerPayment: React.FC<Props> = ({
  selectPayment,
  hasTitle,
  autoSelectCallback,
}) => {
  const { t } = useTranslation()

  // TemplateSaveToWalletCheckbox
  const [checked, setChecked] = useState(false)

  const TemplateCustomerCards: TTemplateCustomerCards = ({
    customerPayments,
    PaymentSourceProvider,
  }) => {
    return (
      <>
        {customerPayments?.map((p, k) => {
          return (
            <div
              key={k}
              data-testid="customer-card"
              onClick={p.handleClick}
              className="flex flex-col items-start p-3 mb-4 text-sm border rounded cursor-pointer lg:flex-row lg:items-center shadow-sm hover:border-black"
            >
              <PaymentSourceProvider value={{ ...p.card }}>
                <PaymentDetails />
              </PaymentSourceProvider>
            </div>
          )
        })}
      </>
    )
  }

  const TemplateSaveToWalletCheckbox = ({
    name,
  }: CustomerSaveToWalletProps) => {
    const handleClick = (
      e: MouseEvent<HTMLInputElement, globalThis.MouseEvent>
    ) => e?.stopPropagation()
    const handleChange = () => {
      setChecked(!checked)
    }

    return (
      <div className="flex items-center mt-4">
        <Field label={t('stepPayment.saveToWallet')}>
          <Checkbox
            name={name}
            id={name}
            data-testid="save-to-wallet"
            type="checkbox"
            className="form-checkbox"
            checked={checked}
            onClick={handleClick}
            onChange={handleChange}
          />
        </Field>
      </div>
    )
  }

  return (
    <>
      <PaymentMethod
        autoSelectSinglePaymentMethod={autoSelectCallback}
        activeClass="active group"
        className="payment"
        // @ts-expect-error Type 'FC<{}>' is not assignable to type 'LoaderType'.
        loader={PaymentSkeleton}
        clickableContainer
        // @ts-expect-error Types of parameters 'params' and 'payment' are incompatible.
        onClick={selectPayment}
      >
        <Box>
          <PaymentSummaryList hasTitle={hasTitle} />
          <Container data-testid="payment-source">
            <PaymentSource
              className="flex flex-col"
              templateCustomerCards={(props) => (
                <TemplateCustomerCards {...props} />
              )}
              templateCustomerSaveToWallet={(props) => (
                <TemplateSaveToWalletCheckbox {...props} />
              )}
              // @ts-expect-error Type 'FC<{}>' is not assignable to type 'LoaderType'.
              loader={PaymentSkeleton}
            >
              <Box>
                <PaymentDetails hasEditButton />
              </Box>
            </PaymentSource>
          </Container>
        </Box>
      </PaymentMethod>
    </>
  )
}
