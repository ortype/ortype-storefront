import { Button, Text } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'

interface Props {
  action: () => void
  testId: string
  height?: string
}

export function AddButton(props: Props): JSX.Element {
  const { t } = useTranslation()

  const { action, testId } = props

  return (
    <Button
      onClick={action}
      data-test-id={testId}
      variant={'subtle'}
      borderColor={'transparent'}
      borderWidth={'2px'}
      bg={'brand.50'}
      _hover={{ bg: '#e3e3e3', borderRadius: '0px' }}
      borderRadius={'100px'}
      transition={
        'border-radius 200ms ease-in-out, box-shadow 200ms ease-in-out, background 200ms ease-in-out'
      }
      size={'sm'}
      fontSize={'lg'}
      {...props}
    >
      <Text as={'span'}>{t('addresses.addNewAddress')}</Text>
    </Button>
  )
}
