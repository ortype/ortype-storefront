import { Heading } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
interface Props {
  orderNumber: number
}

export const MainHeader: React.FC<Props> = ({ orderNumber }) => {
  const { t } = useTranslation()
  // {t('general.checkoutTitle')}#{orderNumber}
  return (
    <>
      <Heading
        textAlign={'center'}
        fontSize={'2rem'}
        fontWeight={'normal'}
        textTransform={'uppercase'}
        mx={'auto'}
        pb={8}
      >
        {'You or me or we or they are buying fonts'}
      </Heading>
    </>
  )
}
