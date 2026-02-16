'use client'
import { useIdentityContext } from '@/commercelayer/providers/identity'
import CustomerAddressForm from '@/components/composite/Account/Address/CustomerAddressForm'
import { CustomerAddressProvider } from '@/components/data/CustomerAddressProvider'
import { AddressesContainer } from '@commercelayer/react-components/addresses/AddressesContainer'

export default function AddressFormPage({ addressId }: { addressId: string }) {
  const { isLoading, settings, config } = useIdentityContext()
  if (isLoading || !settings) return <div />
  console.log('addressId: ', addressId)

  return (
    <CustomerAddressProvider
      accessToken={settings?.accessToken as string}
      domain={config?.domain as string}
      addressId={addressId}
      slug={config?.slug as string}
    >
      <AddressesContainer>
        <CustomerAddressForm addressId={addressId} />
      </AddressesContainer>
    </CustomerAddressProvider>
  )
}
