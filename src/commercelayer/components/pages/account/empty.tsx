import { Button, Flex, Heading, Text } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'

type EmptyType = 'Addresses' | 'Orders' | 'PaymentMethods' | 'Returns'

interface Props {
  type: EmptyType
  buttonClick?: () => void
}

const emptyTypes = [
  {
    type: 'Addresses',
  },
  {
    type: 'Orders',
  },
  {
    type: 'PaymentMethods',
  },
  {
    type: 'Returns',
  },
]

function Empty({ type, buttonClick }: Props): JSX.Element {
  const { t } = useTranslation()

  return (
    <Flex
      direction={'column'}
      gap={1}
      mb={0}
      alignItems={'flex-start'}
      justifyContent={'flex-start'}
    >
      <Heading fontWeight={'normal'} size={'lg'}>
        {t(`no${type}.title`)}
      </Heading>
      <Text textStyle={'sm'}>{t(`no${type}.description`)}</Text>
      {buttonClick && (
        <Button onClick={buttonClick}>
          {t(`no${type}.buttonLabel`) as string}
        </Button>
      )}
    </Flex>
  )
}

export default Empty
