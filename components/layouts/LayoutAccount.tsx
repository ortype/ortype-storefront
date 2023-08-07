import type { Settings } from "CustomApp"
import { useEffect, useContext, useState } from "react"
import styled from "styled-components"
import tw from "twin.macro"

export const GuestWrapper = styled.div`
  ${tw`flex flex-wrap justify-end items-stretch flex-col max-w-screen-md mx-auto min-h-screen md:flex-row`}
`

export const CustomerWrapper = styled.div`
  ${tw`flex flex-wrap justify-end items-stretch flex-col min-h-screen md:flex-row`}
`

export const Main = styled.div`
  ${tw`flex-none justify-center order-first h-screen md:(flex-1 order-last h-auto)`}
`

export const DesktopOnly = styled.div`
  ${tw`hidden lg:(inline bg-gray-50)`}
`

export const Aside = styled.div`
  ${tw`flex-none lg:(flex-1 h-full)`}
`

export const MobileMenu = styled.div`
  ${tw`z-20 fixed top-16 left-0 bottom-0 flex flex-col min-w-full max-w-sm bg-white border-r overflow-y-auto lg:hidden`}
`
import { Base } from "components/ui/Account/Base"
import { Card } from "components/ui/Account/Card"
import { Container } from "components/ui/Account/Container"
import { SettingsContext } from 'components/data/SettingsProvider'

type LayoutAccountProps = Pick<Settings, "isGuest"> & {
  aside: React.ReactNode | null
  main: React.ReactNode
}

export function LayoutAccount({
  main,
  aside,
  isGuest,
}: LayoutAccountProps): JSX.Element {
  const ctx = useContext(SettingsContext)
  const [noScrollClassname, setNoScrollClassName] = useState("")

  useEffect(() => {
    ctx?.showMobileMenu
      ? setNoScrollClassName("overflow-hidden")
      : setNoScrollClassName("")
  }, [ctx?.showMobileMenu])

  return (
    <Base className={noScrollClassname}>
      <Container>
        {isGuest ? (
          <GuestWrapper>
            <Main id="main">
              <Card fullHeight centered>
                {main}
              </Card>
            </Main>
          </GuestWrapper>
        ) : (
          <CustomerWrapper>
            <DesktopOnly>
              <Aside>{aside}</Aside>
            </DesktopOnly>
            {ctx?.showMobileMenu && <MobileMenu>{aside}</MobileMenu>}
            <Main id="main">
              <Card fullHeight centered>
                {main}
              </Card>
            </Main>
          </CustomerWrapper>
        )}
      </Container>
    </Base>
  )
}
