import { useTranslation } from 'react-i18next'

interface Props {
  orderNumber: number
}

export const MainHeader: React.FC<Props> = ({ orderNumber }) => {
  const { t } = useTranslation()
  return (
    <>
      {t('general.checkoutTitle')}#{orderNumber}
    </>
  )
}
