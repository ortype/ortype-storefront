import NavLink from '@/components/composite/Account/NavLink'
import { CustomerField } from '@commercelayer/react-components/customers/CustomerField'
// import ShoppingCartIcon from "@/components/ui/Account/icons/ShoppingCartIcon"
import type { Settings } from 'CustomApp'
import {
  CreditCard,
  Lifebuoy,
  MapPin,
  Package,
  ShoppingCart,
} from 'phosphor-react'
import { useTranslation } from 'react-i18next'

import { Box, Flex } from '@chakra-ui/react'

interface Props {
  settings: Settings
  onClick?: () => void
}

function Navbar({ settings, onClick }: Props): JSX.Element {
  const { t } = useTranslation()
  const { accessToken, logoUrl, companyName } = settings

  const menu = {
    orders: {
      title: t('menu.orders'),
      href: '/account',
      // icon: <ShoppingCartIcon />,
      icon: <ShoppingCart className="w-4" />,
      comingSoon: false,
      accessToken,
      onClick,
    },
    addresses: {
      title: t('menu.addresses'),
      href: '/account/addresses',
      icon: <MapPin className="w-4" />,
      comingSoon: false,
      accessToken,
      onClick,
    },
    wallet: {
      title: t('menu.wallet'),
      href: '/wallet',
      icon: <CreditCard className="w-4" />,
      comingSoon: false,
      accessToken,
      onClick,
    },
    returns: {
      title: t('menu.returns'),
      href: '/returns',
      icon: <Package className="w-4" />,
      comingSoon: true,
      accessToken,
      onClick,
    },
    customerService: {
      title: t('menu.customerService'),
      href: '/customer_service',
      icon: <Lifebuoy className="w-4" />,
      accessToken,
      onClick,
    },
  }

  return (
    <Flex
      data-cy="navbar"
      className={'flex flex-col min-h-full p-5 lg:(p-1 sticky top-8) xl:pl-48'}
    >
      <Box position={'sticky'} top={8}>
        <Box className={'mt-5 w-28'} flex={1}>
          <Box my={16}>
            <ul className="flex flex-col gap-[18px]">
              <NavLink id="orders" {...menu.orders} />
              <NavLink id="addresses" {...menu.addresses} />
              {/*<NavLink id="wallet" {...menu.wallet} />
              <NavLink id="returns" {...menu.returns} />*/}
            </ul>
          </Box>
          {/* <NavLink id="customerService" {...menu.customerService} /> */}
          <Box>
            {t('menu.loggedInAs')}
            <Box>
              <CustomerField name="email" attribute="email" tagElement="p" />
            </Box>
          </Box>
        </Box>
      </Box>
    </Flex>
  )
}

export default Navbar
