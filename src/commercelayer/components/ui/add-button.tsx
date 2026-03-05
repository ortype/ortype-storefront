import { Button, Text } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'

interface Props {
  action: () => void
  testId: string
}

export function AddButton(props: Props): JSX.Element {
  const { t } = useTranslation()

  const { action, testId } = props

  return (
    <Button
      onClick={action}
      data-test-id={testId}
      variant={'subtle'}
      borderColor={'brand.50'}
      borderWidth={'2px'}
      // bg={'white'}
      bg={'brand.50'}
      _hover={{ bg: 'brand.50', borderColor: 'black' }}
      // borderRadius={0}
      borderRadius={'5rem'}
      size={'sm'}
      fontSize={'lg'}
      {...props}
    >
      <Text as={'span'}>{t('addresses.addNewAddress')}</Text>
    </Button>
  )
}
