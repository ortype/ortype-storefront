'use client'
import { AddressesContainer } from '@commercelayer/react-components/addresses/AddressesContainer'
import CustomerAddressForm from '@/components/composite/Account/Address/CustomerAddressForm'
import { CustomerAddressProvider } from '@/components/data/CustomerAddressProvider'
import { SettingsContext } from '@/components/data/SettingsProvider'
import { useContext } from 'react'

export default function AddressFormPage({ addressId }: { addressId: string }) {
  const { isLoading, settings } = useContext(SettingsContext)
  if (isLoading || !settings) return <div />
  console.log('addressId: ', addressId)

  return (
    <CustomerAddressProvider
      accessToken={settings?.accessToken as string}
      domain={settings?.domain as string}
      addressId={addressId}
      slug={settings?.slug as string}
    >
      <AddressesContainer>
        <CustomerAddressForm addressId={addressId} />
      </AddressesContainer>
    </CustomerAddressProvider>
  )
}
