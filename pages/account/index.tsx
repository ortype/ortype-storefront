import AccountContainer from 'components/composite/AccountContainer'
import { SettingsContext } from 'components/data/SettingsProvider'
import { NextPage } from 'next'
import dynamic from 'next/dynamic'
import { useContext } from 'react'

const DynamicAccount: any = dynamic(
  () => import('components/composite/Account/Orders'),
  {
    loading: function LoadingSkeleton() {
      return <div />
    },
  }
)

const Account: NextPage = () => {
  const { isLoading, settings } = useContext(SettingsContext)  

  if (isLoading || (!settings)) return <div />

  return (
    <DynamicAccount 
      settings={settings}       
    />
  )
}

Account.getLayout = function getLayout(page) {
  return (
    <AccountContainer>
      {page}
    </AccountContainer>
  )
}

export default Account
