import { Heading, useSteps } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import type { SingleStepEnum } from '../types'

interface Props {
  orderNumber: number
  steps: Array<{
    key: SingleStepEnum
    label: string
    title: string
    description?: string
  }>
}

export const MainHeader: React.FC<Props> = ({ orderNumber, steps }) => {
  const { t } = useTranslation()
  const stepperHook = useSteps()
  
  // Get the current active step
  const currentStep = steps[stepperHook.value] || steps[0]
  const displayTitle = currentStep?.title || t('general.checkoutTitle')
  
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
        {displayTitle}
      </Heading>
    </>
  )
}
