import React, { useContext, type ReactNode } from 'react'

import { CheckoutContext } from '@/commercelayer/providers/checkout'
import { usePaymentMethodContext } from './payment-method'

export interface CustomerCardsProps {
  handleClick: () => void
}

export interface CustomerSaveToWalletProps {
  name: 'save_payment_source_to_customer_wallet'
}

export type CustomerCardsTemplateChildren = (props: {
  customerPayments?: Array<{
    handleClick: () => void
    card: any
  }>
  PaymentSourceProvider: React.FC<{ value: any; children: ReactNode }>
}) => JSX.Element

interface PaymentSourceProps {
  children?: ReactNode
  className?: string
  readonly?: boolean
  templateCustomerCards?: CustomerCardsTemplateChildren
  onClickCustomerCards?: () => void
  templateCustomerSaveToWallet?: (
    props: CustomerSaveToWalletProps
  ) => JSX.Element
  loader?: ReactNode
}

export const PaymentSource: React.FC<PaymentSourceProps> = ({
  children,
  className,
  readonly = false,
  templateCustomerCards,
  onClickCustomerCards,
  templateCustomerSaveToWallet,
  loader = 'Loading...',
  ...props
}) => {
  const checkoutCtx = useContext(CheckoutContext)
  const paymentMethod = usePaymentMethodContext() // Now returns null if no context

  if (!checkoutCtx) {
    return null
  }

  const { order, isLoading } = checkoutCtx
  const paymentSource = order?.payment_source

  if (isLoading) {
    return <div>{loader}</div>
  }

  // Check if we should show payment source
  const shouldShow = readonly || paymentSource

  if (!shouldShow) {
    return null
  }

  return (
    <PaymentSourceProvider value={paymentSource}>
      <div className={className} {...props}>
        {children}
        {templateCustomerSaveToWallet &&
          templateCustomerSaveToWallet({
            name: 'save_payment_source_to_customer_wallet',
          })}
      </div>
    </PaymentSourceProvider>
  )
}

// Context provider for payment source data
const PaymentSourceContext = React.createContext<any>(null)

interface PaymentSourceProviderProps {
  value: any
  children: ReactNode
}

export const PaymentSourceProvider: React.FC<PaymentSourceProviderProps> = ({
  value,
  children,
}) => {
  return (
    <PaymentSourceContext.Provider value={value}>
      {children}
    </PaymentSourceContext.Provider>
  )
}

export const usePaymentSourceContext = () => {
  const context = useContext(PaymentSourceContext)
  return context // Allow null context for cases where payment source might not exist
}

export default PaymentSource
