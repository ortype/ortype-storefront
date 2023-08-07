import type { Settings } from "HostedApp"
import { useContext } from "react"
import { useTranslation } from "react-i18next"

import {
  Wrapper,
  Title,
  HeaderContainer,
  User,
  Email,
} from "components/composite/Account/Header/styled"
import Avatar from "components/ui/Account/Avatar"
import MenuButton from "components/ui/Account/MenuButton"
import { SettingsContext } from "components/data/SettingsProvider"

type Props = Pick<Settings, "logoUrl" | "companyName">

function CustomerHeader({ logoUrl, companyName }: Props): JSX.Element {
  const { t } = useTranslation()
  const ctx = useContext(SettingsContext)
  const email = ctx?.email as string

  return (
    <HeaderContainer>
      <Wrapper>
        <MenuButton />
        <Title>{t("header.title")}</Title>
        <User>
          <Email>{email}</Email>
          <Avatar email={email} />
        </User>
      </Wrapper>
    </HeaderContainer>
  )
}

export default CustomerHeader
