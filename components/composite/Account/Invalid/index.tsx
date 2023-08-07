import { useTranslation } from "react-i18next"

import { ErrorContainer } from "components/composite/Account/ErrorContainer"
import { ErrorCode, Text } from "components/composite/Account/ErrorContainer/styled"

interface Props {
  statusCode?: string
  message?: string
}

function Invalid(props: Props): JSX.Element {
  const { t } = useTranslation()

  const { statusCode = "404", message = t("general.invalid") } = props

  return (
    <ErrorContainer>
      <ErrorCode>{statusCode}</ErrorCode>
      <Text>{message}</Text>
    </ErrorContainer>
  )
}

export default Invalid
