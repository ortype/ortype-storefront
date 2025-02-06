import { useTranslation } from 'react-i18next'

import { ErrorContainer } from '@/components/composite/Account/ErrorContainer'
import { Heading, Text } from '@chakra-ui/react'

interface Props {
  statusCode?: string
  message?: string
}

function Invalid(props: Props): JSX.Element {
  const { t } = useTranslation()

  const { statusCode = '404', message = t('general.invalid') } = props

  return (
    <ErrorContainer>
      <Heading>{statusCode}</Heading>
      <Text>{message}</Text>
    </ErrorContainer>
  )
}

export default Invalid
