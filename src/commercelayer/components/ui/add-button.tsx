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
      variant={'outline'}
      bg={'white'}
      borderRadius={'5rem'}
      size={'sm'}
      fontSize={'md'}
    >
      <Text as={'span'}>{t('addresses.addNewAddress')}</Text>
    </Button>
  )
}
