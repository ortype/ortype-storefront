// PaymentContainer is simplified since we use CheckoutProvider directly
// The payment gateway configuration is now handled by individual payment components

interface Props {
  children: JSX.Element[] | JSX.Element
}

export const PaymentContainer = ({ children }: Props) => {
  // Simple wrapper component - configuration is handled by CheckoutProvider
  return <div className="payment-container">{children}</div>
}
