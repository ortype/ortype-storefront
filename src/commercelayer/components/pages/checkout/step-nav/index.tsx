'use client'

import { CheckoutContext } from '@/commercelayer/providers/checkout'
import { useIdentityContext } from '@/commercelayer/providers/Identity'
import { defineStyle, Steps, useStepsContext } from '@chakra-ui/react'
import { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import type { SingleStepEnum } from '../types'

// Inline step completion check
const isStepComplete = (
  step: SingleStepEnum,
  ctx: any,
  customer: any
): boolean => {
  switch (step) {
    case 'Email':
      return ctx.hasEmailAddress && customer.userMode
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
    label: string
    description?: string
  }>
}

export const StepNav: React.FC<Props> = ({
  variant = 'line',
  showDescription = false,
  steps,
}) => {
  const { t } = useTranslation()
  const ctx = useContext(CheckoutContext)
  const { customer } = useIdentityContext()
  const stepsContext = useStepsContext()

  if (!ctx) {
    return null
  }
  return (
    <Steps.List css={listStyles}>
      {steps.map((step, index) => {
        const stepComplete = isStepComplete(step.key, ctx, customer)
        const isCurrentStep = stepsContext.value === index

        // Allow navigation to:
        // 1. Any completed step (backward navigation) - UNLESS order is complete
        // 2. The first step (always accessible) - UNLESS order is complete
        // 3. The next incomplete step if all previous steps are complete (forward navigation)
        const allPreviousStepsComplete = steps
          .slice(0, index)
          .every((prevStep) => isStepComplete(prevStep.key, ctx, customer))
        const canNavigateToStep =
          !ctx.isComplete && // Prevent all navigation if order is complete
          (stepComplete || // Can navigate to completed steps
            index === 0 || // First step always accessible
            (!stepComplete && allPreviousStepsComplete)) // Next incomplete step if prerequisites met

        return (
          <Steps.Item key={step.key} index={index} css={itemStyles}>
            {canNavigateToStep ? (
              <Steps.Trigger
                css={isCurrentStep ? activeTriggerStyles : triggerStyles}
              >
                <Steps.Title
                  fontWeight="normal"
                  color={isCurrentStep ? 'white' : undefined}
                >
                  {t(`step${step.key}.label`) || step.label}
                </Steps.Title>
                {showDescription && step.description && (
                  <Steps.Description>
                    {t(`step${step.key}.description`) || step.description}
                  </Steps.Description>
                )}
              </Steps.Trigger>
            ) : (
              // Non-clickable step indicator for incomplete steps
              <Steps.Title css={disabledTitleStyles}>
                {t(`step${step.key}.label`) || step.label}
              </Steps.Title>
            )}
          </Steps.Item>
        )
      })}
    </Steps.List>
  )
}

const listStyles = defineStyle({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '1',
  flexWrap: 'wrap',
})

const itemStyles = defineStyle({
  flex: '0 0 auto',
})

// Shared sizing styles for DRY
const sharedSizing = {
  h: '1.7rem',
  minW: '10',
  textStyle: 'sm',
  px: '0.5rem',
  borderRadius: 'full',
  borderWidth: '2px',
}

const triggerStyles = defineStyle({
  ...sharedSizing,
  cursor: 'pointer',
  borderColor: 'colorPalette.border',
  color: 'colorPalette.fg',
  bg: 'white',
  transitionProperty: 'common',
  transitionDuration: 'moderate',
  _hover: {
    bg: 'colorPalette.subtle',
  },
  _expanded: {
    bg: 'colorPalette.subtle',
  },
})

const activeTriggerStyles = defineStyle({
  ...sharedSizing,
  cursor: 'pointer',
  borderColor: 'black',
  color: 'white',
  bg: 'black',
  transitionProperty: 'common',
  transitionDuration: 'moderate',
  _hover: {
    bg: 'black',
  },
})

const disabledTitleStyles = defineStyle({
  ...sharedSizing,
  display: 'flex',
  alignItems: 'center',
  borderColor: 'colorPalette.border',
  color: 'colorPalette.fg',
  bg: 'white',
  cursor: 'not-allowed',
  opacity: 0.4,
  _disabled: {
    layerStyle: 'disabled',
  },
})
