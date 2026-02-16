'use client'
import { useIdentityContext } from '@/commercelayer/providers/identity'
import CustomerHeader from '@/components/composite/Account/Header/Customer'
import GuestHeader from '@/components/composite/Account/Header/Guest'
import Navbar from '@/components/composite/Account/Navbar'
import { CustomerContainerProvider } from '@/components/composite/CustomerContainerProvider'
import { LayoutAccount } from '@/components/layouts/LayoutAccount'
import { CommerceLayer } from '@commercelayer/react-components'

import { Container } from '@chakra-ui/react'
import type { Settings } from 'CustomApp'
import { IconContext } from 'phosphor-react'
interface Props {
  settings: Settings
  children: React.ReactElement
}

function MyAccountContainer({
  // settings,
  children,
}: Props): JSX.Element {
  const {
    isLoading,
    settings,
    clientConfig: { accessToken },
    config,
  } = useIdentityContext()
  if (isLoading || !settings) return <div />

  return (
    <>
      <IconContext.Provider
        value={{
          size: 32,
          weight: 'fill',
          mirrored: false,
        }}
      >
        <CommerceLayer
          accessToken={accessToken || ''}
          endpoint={config.endpoint}
        >
          <CustomerContainerProvider isGuest={settings.isGuest}>
            <LayoutAccount
              isGuest={settings.isGuest}
              main={
                <>
                  <CustomerHeader
                    logoUrl={settings.logoUrl}
                    companyName={settings.companyName}
                  />
                  <Container>{children}</Container>
                </>
              }
              aside={<Navbar settings={settings} />}
            />
          </CustomerContainerProvider>
        </CommerceLayer>
      </IconContext.Provider>
    </>
  )
}

export default MyAccountContainer
