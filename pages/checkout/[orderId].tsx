import { NextPage } from 'next'
import dynamic from 'next/dynamic'

// import { RetryError } from "components/composite/RetryError"
import { useSettingsOrInvalid } from 'components/hooks/useSettingsOrInvalid'

const DynamicCheckoutContainer: any = dynamic(
  () => import('components/composite/CheckoutContainer'),
  {
    loading: function LoadingSkeleton() {
      return <div />
    },
  }
)
const DynamicCheckout: any = dynamic(
  () => import('components/composite/Checkout'),
  {
    loading: function LoadingSkeleton() {
      return <div />
    },
  }
)

const Order: NextPage = () => {
  const { settings, retryOnError, isLoading } = useSettingsOrInvalid()

  if (isLoading || (!settings && !retryOnError)) return <div />

  if (!settings) {
    if (retryOnError) {
      return <div>{'Retry error'}</div>
    }
    return <div>{'Retry error'}</div>
  }

  return (
    <DynamicCheckoutContainer settings={settings}>
      <DynamicCheckout
        logoUrl={settings.logoUrl}
        orderNumber={settings.orderNumber}
        companyName={settings.companyName}
        supportEmail={settings.supportEmail}
        supportPhone={settings.supportPhone}
        termsUrl={settings.termsUrl}
        privacyUrl={settings.privacyUrl}
      />
    </DynamicCheckoutContainer>
  )
}

export default Order
