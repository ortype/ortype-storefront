import AccountContainer from 'components/composite/AccountContainer'
import OrderPage from 'components/composite/OrderPage'
import { SettingsContext } from 'components/data/SettingsProvider'
import { NextPage } from 'next'
import dynamic from 'next/dynamic'
import { useContext } from 'react'

// @TODO: this route is still throwing errors from the component library
// its confusing as the pattern appears to be the same as the other account
// pages that began working after not using the DynamicAccountContainer and
// moving AccountContainer to the layout

/*
const DynamicOrderPage: any = dynamic(
  () => import('components/composite/OrderPage'),
  {
    loading: function LoadingSkeleton() {
      return <div />
    },
  }
)*/

const Order: NextPage = () => {
  const { isLoading, settings } = useContext(SettingsContext)  

  if (isLoading || (!settings)) return <div />

  return (
    <OrderPage settings={settings} />
  )
}

Order.getLayout = function getLayout(page) {
  return (
    <AccountContainer>
      {page}
    </AccountContainer>
  )
}

export default Order
