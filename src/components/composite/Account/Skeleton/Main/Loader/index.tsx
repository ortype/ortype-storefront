import { usePathname } from 'next/navigation'

import {
  SkeletonMainAddresses,
  SkeletonMainOrder,
  SkeletonMainOrders,
  SkeletonMainParcel,
  SkeletonMainWallet,
} from '@/components/composite/Account/Skeleton/Main'

export function SkeletonMainLoader(): JSX.Element {
  const pathname = usePathname()
  switch (true) {
    case /\/addresses/.test(pathname):
      return <SkeletonMainAddresses />
    case /\/wallet/.test(pathname):
      return <SkeletonMainWallet />
    case /\/parcels/.test(pathname):
      return <SkeletonMainParcel />
    case /\/orders/.test(pathname):
      return <SkeletonMainOrder />
    default:
      return <SkeletonMainOrders />
  }
}
