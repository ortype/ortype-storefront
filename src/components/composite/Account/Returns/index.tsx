import { Container, Heading } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'

function Returns(): JSX.Element {
  const { t } = useTranslation()

  return (
    <Container>
      <Heading>{t('returns.title')}</Heading>
    </Container>
  )
}

export default Returns
