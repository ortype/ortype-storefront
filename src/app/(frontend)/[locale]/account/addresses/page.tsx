'use client'
import dynamic from 'next/dynamic'

const DynamicAddressesPage: any = dynamic(
  () => import('@/commercelayer/components/pages/account/addresses'),
  {
    loading: function LoadingSkeleton() {
      return <div />
    },
  }
)

export default function AddressesPage() {
  return <DynamicAddressesPage />
}
