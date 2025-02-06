'use client'
import CustomerHeader from '@/components/composite/Account/Header/Customer'
import GuestHeader from '@/components/composite/Account/Header/Guest'
import Navbar from '@/components/composite/Account/Navbar'
import { CustomerContainerProvider } from '@/components/composite/CustomerContainerProvider'
import { SettingsContext } from '@/components/data/SettingsProvider'
import { LayoutAccount } from '@/components/layouts/LayoutAccount'
import { Container } from '@chakra-ui/react'
import type { Settings } from 'CustomApp'
import { IconContext } from 'phosphor-react'
import { useContext } from 'react'

interface Props {
  settings: Settings
  children: React.ReactElement
}

function MyAccountContainer({
  // settings,
  children,
}: Props): JSX.Element {
  const { isLoading, settings } = useContext(SettingsContext)
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
        <CustomerContainerProvider isGuest={settings.isGuest}>
          <LayoutAccount
            isGuest={settings.isGuest}
            main={
              <>
                {settings.isGuest ? (
                  <GuestHeader
                    logoUrl={settings.logoUrl}
                    companyName={settings.companyName}
                  />
                ) : (
                  <CustomerHeader
                    logoUrl={settings.logoUrl}
                    companyName={settings.companyName}
                  />
                )}
                <Container>{children}</Container>
              </>
            }
            aside={settings.isGuest ? null : <Navbar settings={settings} />}
          />
        </CustomerContainerProvider>
      </IconContext.Provider>
    </>
  )
}

export default MyAccountContainer
