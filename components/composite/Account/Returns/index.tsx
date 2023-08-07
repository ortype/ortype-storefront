import { useTranslation } from "react-i18next"

import { ReturnsContainer } from "./styled"

import Title from "components/ui/Account/Title"

function Returns(): JSX.Element {
  const { t } = useTranslation()

  return (
    <ReturnsContainer>
      <Title>{t("returns.title")}</Title>
    </ReturnsContainer>
  )
}

export default Returns
