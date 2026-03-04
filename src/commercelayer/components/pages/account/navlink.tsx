import { Badge, Button } from '@chakra-ui/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

type Props = {
  id: string
  title: string
  href: string
  comingSoon?: boolean
  onClick?: () => void
}

function ComingSoonBadge(): JSX.Element {
  return <Badge>Soon</Badge>
}

function NavLink(props: Props): JSX.Element {
  const { href, title } = props
  const pathname = usePathname() || ''
  const isCurrentPage = href === pathname

  // if (comingSoon) return <NavLinkButton {...props} />

  return (
    <Button
      asChild
      aria-current={isCurrentPage && 'page'}
      _currentPage={{ bg: 'black', color: 'white' }}
      variant={'outline'}
      borderRadius={'full'}
      h={'1.7rem'}
      textStyle={'sm'}
      px={'0.5rem'}
    >
      <Link href={`${href}`}>{title}</Link>
    </Button>
  )
}

export default NavLink
