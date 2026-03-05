import dynamic from 'next/dynamic'

const DynamicAccountAddressFormPage: any = dynamic(
  () =>
    import(
      '@/commercelayer/components/pages/account/address/address-form-page'
    ),
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
