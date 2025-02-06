import { useTranslation } from 'next-i18next'

import { ErrorContainer } from '@/components/composite/ErrorContainer'
import { Box, Text } from '@chakra-ui/react'

export const RetryError = () => {
  const { t } = useTranslation()

  return (
    <ErrorContainer>
      <Box>{t('general.retry_error_code')}</Box>
      <Text data-testid="invalid-checkout">
        {t('general.retry_error_description')}
      </Text>
    </ErrorContainer>
  )
}
