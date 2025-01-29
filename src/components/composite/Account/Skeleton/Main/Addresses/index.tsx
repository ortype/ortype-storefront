import {
  SkeletonMainPageTitle,
  SkeletonMainAddressCard,
} from '@/components/composite/Account/Skeleton/Main/Common'
import {
  SkeletonWrapper,
  SkeletonButton,
} from '@/components/composite/Account/Skeleton/styled'

interface Props {
  visible?: boolean
}

export function SkeletonMainAddresses({ visible = true }: Props): JSX.Element {
  return (
    <SkeletonWrapper visible={visible}>
      <SkeletonMainPageTitle />
      <SkeletonMainAddressCard showActions />
      <SkeletonButton className="w-full mt-8" />
    </SkeletonWrapper>
  )
}
