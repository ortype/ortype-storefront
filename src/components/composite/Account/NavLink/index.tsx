import { CustomerContext } from '@/components/data/CustomerProvider'
import type { Settings } from 'CustomApp'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useContext } from 'react'

import { ComingSoon, Icon, Title, TitleWrapper, Wrapper } from './styled'

type Props = Pick<Settings, 'accessToken'> & {
  id: string
  title: string
  href: string
  icon: React.ReactNode
  comingSoon?: boolean
  onClick?: () => void
}

function ComingSoonBadge(): JSX.Element {
  return <ComingSoon>Soon</ComingSoon>
}

function NavLinkButton(props: Props): JSX.Element {
  const { title, href, icon, comingSoon, onClick } = props

  const router = useRouter()
  const pathname = usePathname() || ''
  const hrefWithoutBase = pathname.split('?')[0]
  const isCurrentPage = pathname.indexOf(hrefWithoutBase) >= 0

  return (
    <Wrapper
      isCurrentPage={isCurrentPage}
      comingSoon={comingSoon}
      onClick={onClick}
    >
      <Icon comingSoon={comingSoon}>{icon}</Icon>
      <TitleWrapper>
        <Title>{title}</Title>
        {comingSoon && <ComingSoonBadge />}
      </TitleWrapper>
    </Wrapper>
  )
}

function NavLink(props: Props): JSX.Element {
  const { href, accessToken, comingSoon } = props

  const ctx = useContext(CustomerContext)

  if (comingSoon) return <NavLinkButton {...props} />

  return (
    <Link href={`${href}`} onClick={() => ctx?.closeMobileMenu()}>
      <NavLinkButton {...props} />
    </Link>
  )
}

export default NavLink
