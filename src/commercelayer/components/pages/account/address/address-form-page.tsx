'use client'
import CustomerAddressForm from '@/commercelayer/components/pages/account/address/customer-address-form'
import { useIdentityContext } from '@/commercelayer/providers/identity'
import { CustomerAddressProvider } from '@/commercelayer/providers/customer-address'
import { AddressesContainer } from '@commercelayer/react-components/addresses/AddressesContainer'

export default function AddressFormPage({ addressId }: { addressId: string }) {
  const { isLoading, settings, config } = useIdentityContext()
  if (isLoading || !settings) return <div />

  console.log('addressId: ', settings, addressId)

  return (
    <CustomerAddressProvider
      accessToken={settings?.accessToken as string}
      domain={config?.domain as string}
      slug={config?.slug as string}
      addressId={addressId}
    >
      <AddressesContainer>
        <CustomerAddressForm addressId={addressId} />
      </AddressesContainer>
    </CustomerAddressProvider>
  )
}
