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

const DynamicAccount: any = dynamic(
  () => import('components/composite/Account/Orders'),
  {
    loading: function LoadingSkeleton() {
      return <div />
    },
  }
)

const Account: NextPage = () => {
  // const { settings, retryOnError, isLoading } = useSettingsOrInvalid()

  // const customerCtx = useContext(CustomerContext)
  const { isLoading, settings } = useContext(SettingsContext)  

  if (isLoading || (!settings)) return <div />

  return (
    <DynamicAccountContainer settings={settings}>
      <DynamicAccount 
        settings={settings}       
      />
    </DynamicAccountContainer>
  )
}

export default Account
