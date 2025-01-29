import dynamic from 'next/dynamic'

const DynamicAccountAddressFormPage: any = dynamic(
  () => import('@/components/composite/Account/Address/AddressFormPage'),
  {
    loading: function LoadingSkeleton() {
      return <div />
    },
  }
)

export default function EditAddress({
  params,
}: {
  params: { addressId: string }
}) {
  return <DynamicAccountAddressFormPage addressId={params.addressId} />
}
