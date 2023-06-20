import { Box } from '@chakra-ui/react'
import type { Order } from '@commercelayer/sdk'
import classNames from 'classnames'
import { AccordionContext } from 'components/data/AccordionProvider'
import { CheckoutContext } from 'components/data/CheckoutProvider'
import { StepContainer } from 'components/ui/StepContainer'
import { StepHeader } from 'components/ui/StepHeader'
import { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

interface Props {
  className?: string
  step: number
}

export interface ShippingToggleProps {
  forceShipping?: boolean
  disableToggle: boolean
}

export const StepHeaderLicense: React.FC<Props> = ({ step }) => {
  const checkoutCtx = useContext(CheckoutContext)
  const accordionCtx = useContext(AccordionContext)
  if (!checkoutCtx || !accordionCtx) {
    return null
  }

  const { hasEmailAddress, emailAddress } = checkoutCtx

  const { t } = useTranslation()

  const recapText = () => {
    if (!hasEmailAddress || accordionCtx.status === 'edit') {
      return (
        <>
          <p>{t('stepLicense.notSet')}</p>
        </>
      )
    }

    return (
      <>
        <p data-testid="Email-email-step-header">{emailAddress}</p>
      </>
    )
  }

  return (
    <StepHeader
      stepNumber={step}
      status={accordionCtx.status}
      label={t('stepLicense.title')}
      info={recapText()}
      onEditRequest={accordionCtx.setStep}
    />
  )
}

export const StepLicense: React.FC<Props> = () => {
  const checkoutCtx = useContext(CheckoutContext)
  const accordionCtx = useContext(AccordionContext)

  const [isLocalLoader, setIsLocalLoader] = useState(false)

  if (!checkoutCtx || !accordionCtx) {
    return null
  }
  const { isGuest, emailAddress, hasEmailAddress, setCustomerEmail } =
    checkoutCtx

  // @TODO: reference shipping/billing address forms for this
  // we don't need an address book or seperate shipping billing addresses
  // we just need to store `isLicenseForClient` and `licenseOwner` in the metadata of the
  // order... and if it's for "yourself" we do not show a form

  return (
    <StepContainer
      className={classNames({
        current: accordionCtx.isActive,
        done: !accordionCtx.isActive,
        submitting: isLocalLoader,
      })}
    >
      <Box>
        <>{accordionCtx.isActive && <>{'License form...'}</>}</>
      </Box>
    </StepContainer>
  )
}
