import CustomerHeader from "components/composite/Account/Header/Customer"
import GuestHeader from "components/composite/Account/Header/Guest"
import Navbar from "components/composite/Account/Navbar"
import { CustomerContainerProvider } from "components/composite/CustomerContainerProvider"
import { LayoutAccount } from "components/layouts/LayoutAccount"
import { FooterWrapper } from "components/ui/Account/Common/styled"
import Footer from "components/ui/Account/Footer"
import PageMain from "components/ui/Account/PageMain"
import type { Settings } from "CustomApp"
import { IconContext } from "phosphor-react"
import { SettingsContext } from 'components/data/SettingsProvider'
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
  if (isLoading || (!settings)) return <div />  

  return (
    <>
          <IconContext.Provider
            value={{
              size: 32,
              weight: "fill",
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
                      <PageMain>{children}</PageMain>
                      <FooterWrapper>
                        <Footer />
                      </FooterWrapper>
                    </>
                  }
                  aside={
                    settings.isGuest ? null : <Navbar settings={settings} />
                  }
                />
              </CustomerContainerProvider>
          </IconContext.Provider>
    </>
  )
}

export default MyAccountContainer
