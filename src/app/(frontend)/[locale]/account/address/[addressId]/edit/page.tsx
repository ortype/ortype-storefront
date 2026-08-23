import dynamic from 'next/dynamic'

const DynamicAccountAddressFormPage: any = dynamic(
  () =>
    import('@/commercelayer/components/pages/account/address/address-form-page'),
  {
    loading: function LoadingSkeleton() {
      return <div />
    },
  },
)

export default async function Page({
  params,
}: {
  params: Promise<{ addressId: string }>
}) {
  const { addressId } = await params
  return <DynamicAccountAddressFormPage addressId={addressId} />
}
