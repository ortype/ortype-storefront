import { CustomerField } from '@commercelayer/react-components/customers/CustomerField'
import NavLink from '@/components/composite/Account/NavLink'
// import ShoppingCartIcon from "@/components/ui/Account/icons/ShoppingCartIcon"
import Footer from '@/components/ui/Account/Footer'
import type { Settings } from 'HostedApp'
import {
  CreditCard,
  Lifebuoy,
  MapPin,
  Package,
  ShoppingCart,
} from 'phosphor-react'
import { useTranslation } from 'react-i18next'

import {
  Email,
  EmailWrapper,
  FooterWrapper,
  LogoWrapper,
  MenuWrapper,
  Nav,
  Sidebar,
  Wrapper,
} from './styled'

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
    <Sidebar data-cy="navbar">
      <Wrapper>
        <MenuWrapper>
          <Nav>
            <ul className="flex flex-col gap-[18px]">
              <NavLink id="orders" {...menu.orders} />
              <NavLink id="addresses" {...menu.addresses} />
              {/*<NavLink id="wallet" {...menu.wallet} />
              <NavLink id="returns" {...menu.returns} />*/}
            </ul>
          </Nav>
          {/* <NavLink id="customerService" {...menu.customerService} /> */}
          <EmailWrapper>
            {t('menu.loggedInAs')}
            <Email>
              <CustomerField name="email" attribute="email" tagElement="p" />
            </Email>
          </EmailWrapper>
          <FooterWrapper>
            <Footer />
          </FooterWrapper>
        </MenuWrapper>
      </Wrapper>
    </Sidebar>
  )
}

export default Navbar
