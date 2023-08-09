import AccountContainer from 'components/composite/AccountContainer'
import { SettingsContext } from 'components/data/SettingsProvider'
import { NextPage } from 'next'
import dynamic from 'next/dynamic'
import { useContext } from 'react'


const DynamicAddressesPage: any = dynamic(
  () => import('components/composite/AddressesPage'),
  {
    loading: function LoadingSkeleton() {
      return <div />
    },
  }
)

const AddressesPage: NextPage = () => {
  const { isLoading, settings } = useContext(SettingsContext)  

  if (isLoading || (!settings)) return <div />

  return (
    <DynamicAddressesPage settings={settings} />
  )
}

AddressesPage.getLayout = function getLayout(page) {
  return (
    <AccountContainer>
      {page}
    </AccountContainer>
  )
}


export default AddressesPage
