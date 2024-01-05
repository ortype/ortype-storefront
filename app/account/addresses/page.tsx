import dynamic from 'next/dynamic'

const DynamicAddressesPage: any = dynamic(
  () => import('components/composite/AddressesPage'),
  {
    loading: function LoadingSkeleton() {
      return <div />
    },
  }
)

export default function AddressesPage() {
  return <DynamicAddressesPage />
}
