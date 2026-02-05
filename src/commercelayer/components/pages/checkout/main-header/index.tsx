import { Heading, useSteps, useStepsContext } from '@chakra-ui/react'
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
  const stepsContext = useStepsContext()
  // Get the current active step
  const currentStep = steps[stepsContext.value] || steps[0]
  const displayTitle = currentStep?.title || t('general.checkoutTitle')

  return (
    <>
      <Heading
        textAlign={'center'}
        fontSize={'2rem'}
        fontWeight={'normal'}
        textTransform={'uppercase'}
        mx={'auto'}
        pb={4}
      >
        {stepsContext.isCompleted ? 'Thank you for your order!' : displayTitle}
      </Heading>
    </>
  )
}
