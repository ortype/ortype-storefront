import NavLink from '@/commercelayer/components/pages/account/navlink'
import { useTranslation } from 'react-i18next'

import { ButtonGroup } from '@chakra-ui/react'

interface Props {
  onClick?: () => void
}

function Navbar({ onClick }: Props): JSX.Element {
  const { t } = useTranslation()

  const menu = {
    purchases: {
      title: t('menu.purchases'),
      href: '/account',
      comingSoon: false,
      onClick,
    },
    profile: {
      title: t('menu.profile'),
      href: '/account/profile',
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
    <ButtonGroup size={'sm'} my={2} gap={1}>
      <NavLink id="orders" {...menu.purchases} />
      <NavLink id="profile" {...menu.profile} />
    </ButtonGroup>
  )
}

export default Navbar
