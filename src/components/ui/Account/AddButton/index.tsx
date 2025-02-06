import { Button, Text } from '@chakra-ui/react'
import { PlusCircle } from 'phosphor-react'
import { useTranslation } from 'react-i18next'

interface Props {
  action: () => void
  testId: string
}

export function AddButton(props: Props): JSX.Element {
  const { t } = useTranslation()

  const { action, testId } = props

  return (
    <Button onClick={action} className="group" data-test-id={testId}>
      <PlusCircle className="w-5 md:w-6" />
      <Text as={'span'}>{t('addresses.addNewAddress')}</Text>
    </Button>
  )
}
