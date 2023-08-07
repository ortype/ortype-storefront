import { Wrapper, LogoWrapper, FullLogo, Main, Error } from "./styled"

import { Base } from "components/ui/Account/Base"
import { FooterWrapper } from "components/ui/Account/Common/styled"
import { Container } from "components/ui/Account/Container"
import Footer from "components/ui/Account/Footer"

export function ErrorContainer({
  children,
}: {
  children: React.ReactNode
}): JSX.Element {
  return (
    <Base>
      <Container>
        <Wrapper>
          <LogoWrapper>
            <FullLogo className="self-center text-black md:pl-4 md:self-auto" />
          </LogoWrapper>
          <Main>
            <Error>{children}</Error>
          </Main>
          <FooterWrapper>
            <Footer />
          </FooterWrapper>
        </Wrapper>
      </Container>
    </Base>
  )
}
