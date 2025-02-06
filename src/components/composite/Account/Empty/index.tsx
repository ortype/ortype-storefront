import NoAddressesIcon from '@/components/ui/Account/icons/NoAddressesIcon'
import NoOrdersIcon from '@/components/ui/Account/icons/NoOrdersIcon'
import NoPaymentMethodsIcon from '@/components/ui/Account/icons/NoPaymentMethodsIcon'
import NoReturnsIcon from '@/components/ui/Account/icons/NoReturnsIcon'
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
    icon: <NoAddressesIcon />,
  },
  {
    type: 'Orders',
    icon: <NoOrdersIcon />,
  },
  {
    type: 'PaymentMethods',
    icon: <NoPaymentMethodsIcon />,
  },
  {
    type: 'Returns',
    icon: <NoReturnsIcon />,
  },
]

function Empty({ type, buttonClick }: Props): JSX.Element {
  const { t } = useTranslation()
  const icon = emptyTypes.find((emptyType) => emptyType.type === type)?.icon

  return (
    <Flex alignItems={'center'} justifyContent={'center'}>
      {icon}
      <Heading>{t(`no${type}.title`)}</Heading>
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
