import { AddressesContainer } from "@commercelayer/react-components/addresses/AddressesContainer"
import CustomerAddressForm from "components/composite/Account/Address/CustomerAddressForm"
import { CustomerAddressProvider } from "components/data/CustomerAddressProvider"
import { CustomerContext } from 'components/data/CustomerProvider'
import { SettingsContext } from 'components/data/SettingsProvider'
import { NextPage } from 'next'
import { useRouter } from 'next/router'
import { useContext } from "react"

const AddressFormPage: NextPage = () => {
  const { query } = useRouter()
  const addressId = query == null ? undefined : query.addressId
  const { settings } = useContext(SettingsContext)
  console.log('addressId: ', settings, addressId)

  return (
    <CustomerAddressProvider
      accessToken={settings?.accessToken as string}
      domain={settings?.domain as string}
      slug={settings?.slug as string}
      addressId={addressId}
    >
      <AddressesContainer>
        <CustomerAddressForm />
      </AddressesContainer>
    </CustomerAddressProvider>
  )
}

export default AddressFormPage
