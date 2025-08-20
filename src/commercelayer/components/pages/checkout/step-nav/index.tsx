'use client'

import { CheckoutContext } from '@/commercelayer/providers/checkout'
import { Steps } from '@chakra-ui/react'
import { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import type { SingleStepEnum } from '../types'

// Inline step completion check
const isStepComplete = (step: SingleStepEnum, ctx: any): boolean => {
  switch (step) {
    case 'Email':
      return ctx.hasEmailAddress
    case 'Address':
      return (
        ctx.hasBillingAddress &&
        (!ctx.isShipmentRequired || ctx.hasShippingAddress)
      )
    case 'License':
      return ctx.hasLicenseOwner
    case 'Shipping':
      return !ctx.isShipmentRequired || ctx.hasShippingMethod
    case 'Payment':
      return ctx.hasPaymentMethod
    default:
      return false
  }
}

interface Props {
  variant?: 'line' | 'solid'
  showDescription?: boolean
  steps: Array<{
    key: SingleStepEnum
    title: string
    description?: string
  }>
}

export const StepNav: React.FC<Props> = ({
  variant = 'line',
  size = 'md',
  showDescription = false,
  steps,
}) => {
  const { t } = useTranslation()
  const ctx = useContext(CheckoutContext)

  if (!ctx) {
    return null
  }
  return (
    <Steps.List size={size}>
      {steps.map((step, index) => {
        const stepComplete = isStepComplete(step.key, ctx)
        // Allow navigation to:
        // 1. Any completed step (backward navigation)
        // 2. The first step (always accessible)
        // 3. The next incomplete step if all previous steps are complete (forward navigation)
        const allPreviousStepsComplete = steps
          .slice(0, index)
          .every((prevStep) => isStepComplete(prevStep.key, ctx))
        const canNavigateToStep =
          stepComplete || // Can always navigate to completed steps
          index === 0 || // First step always accessible
          (!stepComplete && allPreviousStepsComplete) // Next incomplete step if prerequisites met

        return (
          <Steps.Item
            key={step.key}
            index={index}
            title={t(`step${step.key}.title`) || step.title}
          >
            {canNavigateToStep ? (
              <Steps.Trigger>
                <Steps.Indicator />
                <Steps.Title>
                  {t(`step${step.key}.title`) || step.title}
                </Steps.Title>
                {showDescription && step.description && (
                  <Steps.Description>
                    {t(`step${step.key}.description`) || step.description}
                  </Steps.Description>
                )}
              </Steps.Trigger>
            ) : (
              // Non-clickable step indicator for incomplete steps
              <>
                <Steps.Indicator />
                <Steps.Title>
                  {t(`step${step.key}.title`) || step.title}
                </Steps.Title>
                {showDescription && step.description && (
                  <Steps.Description>
                    {t(`step${step.key}.description`) || step.description}
                  </Steps.Description>
                )}
              </>
            )}
            <Steps.Separator />
          </Steps.Item>
        )
      })}
    </Steps.List>
  )
}
