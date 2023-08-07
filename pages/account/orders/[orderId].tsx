import { SettingsContext } from 'components/data/SettingsProvider'
import { NextPage } from 'next'
import dynamic from 'next/dynamic'
import { useContext } from 'react'

const DynamicAccountContainer: any = dynamic(
  () => import('components/composite/AccountContainer'),
  {
    loading: function LoadingSkeleton() {
      return <div />
    },
  }
)

const DynamicOrderPage: any = dynamic(
  () => import('components/composite/OrderPage'),
  {
    loading: function LoadingSkeleton() {
      return <div />
    },
  }
)

const Order: NextPage = () => {
  // const { settings, retryOnError, isLoading } = useSettingsOrInvalid()
  // const customerCtx = useContext(CustomerContext)
  const { isLoading, settings } = useContext(SettingsContext)  

  if (isLoading || (!settings)) return <div />

  return (
    <DynamicAccountContainer settings={settings}>
      <DynamicOrderPage settings={settings} />
    </DynamicAccountContainer>
  )
}

export default Order
