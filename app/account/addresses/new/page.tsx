import dynamic from 'next/dynamic'

const DynamicCustomerAddressProvider: any = dynamic(() => import('./New'), {
  loading: function LoadingSkeleton() {
    return <div />
  },
})

export default function AddressFormPage({
  params,
}: {
  params: { addressId: string }
}) {
  return <DynamicCustomerAddressProvider addressId={params.addressId} />
}
