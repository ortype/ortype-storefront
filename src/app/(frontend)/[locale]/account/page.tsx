import { NextPage } from 'next'
import dynamic from 'next/dynamic'

const DynamicAccount: any = dynamic(
  () => import('@/components/composite/Account/Orders'),
  {
    loading: function LoadingSkeleton() {
      return <div />
    },
  }
)

const Account: NextPage = () => {
  return <DynamicAccount />
}

export default Account
