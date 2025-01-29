import { useTranslation } from 'react-i18next'

import { ErrorContainer } from '@/components/composite/Account/ErrorContainer'
import {
  ErrorCode,
  Text,
} from '@/components/composite/Account/ErrorContainer/styled'

export const RetryError = () => {
  const { t } = useTranslation()

  return (
    <ErrorContainer>
      <ErrorCode>{t('general.retry_error_code')}</ErrorCode>
      <Text data-test-id="invalid-checkout">
        {t('general.retry_error_description')}
      </Text>
    </ErrorContainer>
  )
}
