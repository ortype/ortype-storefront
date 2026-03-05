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

export default function NewAddress() {
  return <DynamicAccountAddressFormPage />
}
