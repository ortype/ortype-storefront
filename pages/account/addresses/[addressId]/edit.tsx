import { SettingsContext } from 'components/data/SettingsProvider'
import { NextPage } from 'next'
import dynamic from 'next/dynamic'
import { useContext } from 'react'
import AccountContainer from 'components/composite/AccountContainer'

const DynamicAccountAddressFormPage: any = dynamic(
  () => import('components/composite/Account/Address/AddressFormPage'),
  {
    loading: function LoadingSkeleton() {
      return <div />
    },
  }
)

const EditAddress: NextPage = () => {
  // const { settings, retryOnError, isLoading } = useSettingsOrInvalid()

  // const customerCtx = useContext(CustomerContext)
  const { isLoading, settings } = useContext(SettingsContext)  

  if (isLoading || (!settings)) return <div />

  return (
      <DynamicAccountAddressFormPage 
      />
  )
}


EditAddress.getLayout = function getLayout(page) {
  return (
    <AccountContainer>
      {page}
    </AccountContainer>
  )
}



export default EditAddress
