import { AddressesContainer } from "@commercelayer/react-components/addresses/AddressesContainer"
import CustomerAddressForm from "components/composite/Account/Address/CustomerAddressForm"
import { CustomerAddressProvider } from "components/data/CustomerAddressProvider"
import { SettingsContext } from 'components/data/SettingsProvider'
import { NextPage } from 'next'
import { useRouter } from 'next/router'
import { useContext } from "react"
import dynamic from 'next/dynamic'
import AccountContainer from 'components/composite/AccountContainer'


const DynamicCustomerAddressProvider: any = dynamic(
  () => import("components/data/CustomerAddressProvider"),
  {
    loading: function LoadingSkeleton() {
      return <div />
    },
  }
)


const AddressFormPage: NextPage = () => {
  const { query } = useRouter()
  const addressId = query == null ? undefined : query.addressId
  const { settings } = useContext(SettingsContext)
  console.log('addressId: ', addressId)

  return (
    <DynamicCustomerAddressProvider
      accessToken={settings?.accessToken as string}
      domain={settings?.domain as string}
      addressId={addressId}
    >
      <AddressesContainer>
        <CustomerAddressForm />
      </AddressesContainer>
    </DynamicCustomerAddressProvider>
  )
}


AddressFormPage.getLayout = function getLayout(page) {
  return (
    <AccountContainer>
      {page}
    </AccountContainer>
  )
}




export default AddressFormPage
