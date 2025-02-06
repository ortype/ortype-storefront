import { useTranslation } from 'react-i18next'

import { ErrorContainer } from '@/components/composite/Account/ErrorContainer'
import { Heading, Text } from '@chakra-ui/react'

export const RetryError = () => {
  const { t } = useTranslation()

  return (
    <ErrorContainer>
      <Heading>{t('general.retry_error_code')}</Heading>
      <Text data-test-id="invalid-checkout">
        {t('general.retry_error_description')}
      </Text>
    </ErrorContainer>
  )
}
