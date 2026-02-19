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
      gap={2}
      mb={4}
      alignItems={'flex-start'}
      justifyContent={'flex-start'}
    >
      <Heading fontWeight={'normal'} size={'2xl'}>
        {t(`no${type}.title`)}
      </Heading>
      <Text>{t(`no${type}.description`)}</Text>
      {buttonClick && (
        <Button onClick={buttonClick}>
          {t(`no${type}.buttonLabel`) as string}
        </Button>
      )}
    </Flex>
  )
}

export default Empty
