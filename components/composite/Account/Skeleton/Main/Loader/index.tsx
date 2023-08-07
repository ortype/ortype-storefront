import { useRouter } from "next/router"

import {
  SkeletonMainAddresses,
  SkeletonMainWallet,
  SkeletonMainOrders,
  SkeletonMainOrder,
  SkeletonMainParcel,
} from "components/composite/Account/Skeleton/Main"

export function SkeletonMainLoader(): JSX.Element {
  const { pathname } = useRouter()
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
