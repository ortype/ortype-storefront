import type { Settings } from 'HostedApp'

import {
  Wrapper,
  HeaderContainer,
} from '@/components/composite/Account/Header/styled'
import MenuButton from '@/components/ui/Account/MenuButton'

type Props = Pick<Settings, 'logoUrl' | 'companyName'>

function GuestHeader({ logoUrl, companyName }: Props): JSX.Element {
  return (
    <HeaderContainer>
      <Wrapper>
        <MenuButton />
      </Wrapper>
    </HeaderContainer>
  )
}

export default GuestHeader
