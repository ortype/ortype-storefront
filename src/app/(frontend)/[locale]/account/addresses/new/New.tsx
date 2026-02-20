'use client'
import CustomerAddressForm from '@/commercelayer/components/pages/account/address/customer-address-form'
import AddressesContainer from '@/commercelayer/providers/addresses'
import { CustomerAddressProvider } from '@/commercelayer/providers/customer-address'
import { useIdentityContext } from '@/commercelayer/providers/identity'

export default function AddressFormPage({ addressId }: { addressId: string }) {
  const { isLoading, settings, clientConfig } = useIdentityContext()
  if (isLoading || !settings) return <div />
  console.log('addressId: ', addressId)

  return (
    <CustomerAddressProvider
      accessToken={settings?.accessToken as string}
      domain={clientConfig?.domain as string}
      addressId={addressId}
      slug={clientConfig?.slug as string}
    >
      <AddressesContainer>
        <CustomerAddressForm addressId={addressId} />
      </AddressesContainer>
    </CustomerAddressProvider>
  )
}
