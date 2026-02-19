import NavLink from '@/commercelayer/components/pages/account/navlink'
import { useTranslation } from 'react-i18next'

import { Box, Flex, VStack } from '@chakra-ui/react'

interface Props {
  onClick?: () => void
}

function Navbar({ onClick }: Props): JSX.Element {
  const { t } = useTranslation()

  const menu = {
    orders: {
      title: t('menu.orders'),
      href: '/account',
      comingSoon: false,
      onClick,
    },
    addresses: {
      title: t('menu.addresses'),
      href: '/account/addresses',
      comingSoon: false,
      onClick,
    },
    wallet: {
      title: t('menu.wallet'),
      href: '/wallet',
      comingSoon: false,
      onClick,
    },
    returns: {
      title: t('menu.returns'),
      href: '/returns',
      comingSoon: true,
      onClick,
    },
    customerService: {
      title: t('menu.customerService'),
      href: '/customer_service',
      onClick,
    },
  }

  return (
    <VStack my={2} bg={'brand.50'} p={4} gap={3} alignItems={'flex-start'}>
      <NavLink id="orders" {...menu.orders} />
      <NavLink id="addresses" {...menu.addresses} />
    </VStack>
  )
}

export default Navbar
