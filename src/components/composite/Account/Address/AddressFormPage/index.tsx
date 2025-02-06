'use client'
import { useIdentityContext } from '@/commercelayer/providers/Identity'
import CustomerAddressForm from '@/components/composite/Account/Address/CustomerAddressForm'
import { CustomerAddressProvider } from '@/components/data/CustomerAddressProvider'
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
