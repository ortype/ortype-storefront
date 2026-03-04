'use client'
import CustomerAddressForm from '@/commercelayer/components/pages/account/address/customer-address-form'
import AddressesContainer from '@/commercelayer/providers/addresses'
import { CustomerAddressProvider } from '@/commercelayer/providers/customer-address'
import { useIdentityContext } from '@/commercelayer/providers/identity'

export default function AddressFormPage({ addressId }: { addressId?: string }) {
  const { isLoading, settings, config } = useIdentityContext()
  if (isLoading || !settings) return <div />

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
