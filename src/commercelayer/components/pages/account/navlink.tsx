import { Badge, Link as ChakraLink, Flex, Text } from '@chakra-ui/react'
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

function NavLinkButton(props: Props): JSX.Element {
  const { title, comingSoon, onClick } = props
  return (
    <Flex alignItems={'flex-start'} onClick={onClick}>
      <Text>{title}</Text>
      {comingSoon && <ComingSoonBadge />}
    </Flex>
  )
}

function NavLink(props: Props): JSX.Element {
  const { href, comingSoon } = props
  const pathname = usePathname() || ''
  // const hrefWithoutBase = href.split('?')[0]
  // const isCurrentPage = pathname.indexOf(hrefWithoutBase) >= 0
  const isCurrentPage = href === pathname

  /*
  const title = props.title
  console.log('NavLink: ', isCurrentPage, {
    title,
    href,
    pathname,
    hrefWithoutBase,
    isCurrentPage,
  })
  */

  if (comingSoon) return <NavLinkButton {...props} />

  return (
    <ChakraLink
      as={Link}
      aria-current={isCurrentPage && 'page'}
      _currentPage={{ textDecoration: 'underline' }}
      href={`${href}`}
    >
      <NavLinkButton {...props} />
    </ChakraLink>
  )
}

export default NavLink
