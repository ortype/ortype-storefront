import { CustomerContext } from '@/components/data/CustomerProvider'
import { Box, Flex, Text } from '@chakra-ui/react'
import type { Settings } from 'CustomApp'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useContext } from 'react'

type Props = Pick<Settings, 'accessToken'> & {
  id: string
  title: string
  href: string
  icon: React.ReactNode
  comingSoon?: boolean
  onClick?: () => void
}

function ComingSoonBadge(): JSX.Element {
  return (
    <Box
      className={
        'ml-1 uppercase px-[4px] py-[2px] text-[9px] leading-[9px] font-bold rounded text-white bg-red-400'
      }
    >
      Soon
    </Box>
  )
}

function NavLinkButton(props: Props): JSX.Element {
  const { title, href, icon, comingSoon, onClick } = props

  const router = useRouter()
  const pathname = usePathname() || ''
  const hrefWithoutBase = pathname.split('?')[0]
  const isCurrentPage = pathname.indexOf(hrefWithoutBase) >= 0

  return (
    <Flex
      alignItems={'center'}
      isCurrentPage={isCurrentPage}
      comingSoon={comingSoon}
      onClick={onClick}
    >
      <Flex>
        <Text>{title}</Text>
        {comingSoon && <ComingSoonBadge />}
      </Flex>
    </Flex>
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
