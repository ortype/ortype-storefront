import { AccordionContext } from '@/components/data/AccordionProvider'
import { CheckoutContext } from '@/components/data/CheckoutProvider'
import { StepHeader } from '@/components/ui/StepHeader'
import { Box } from '@chakra-ui/react'
import type { Order } from '@commercelayer/sdk'
import classNames from 'classnames'
import { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CheckoutCustomerAddresses } from './CheckoutCustomerAddresses'

interface Props {
  className?: string
  step: number
}

export interface ShippingToggleProps {
  forceShipping?: boolean
  disableToggle: boolean
}

export const StepHeaderCustomer: React.FC<Props> = ({ step }) => {
  const checkoutCtx = useContext(CheckoutContext)
  const accordionCtx = useContext(AccordionContext)
  if (!checkoutCtx || !accordionCtx) {
    return null
  }

  const { hasShippingAddress, hasBillingAddress, emailAddress } = checkoutCtx

  const { t } = useTranslation()

  const recapText = () => {
    if (
      (!hasShippingAddress && !hasBillingAddress) ||
      accordionCtx.status === 'edit'
    ) {
      return (
        <>
          <p>{t('stepAddress.notSet')}</p>
        </>
      )
    }

    return (
      <>
        <p data-testid="customer-email-step-header">{emailAddress}</p>
      </>
    )
  }

  return (
    <StepHeader
      stepNumber={step}
      status={accordionCtx.status}
      label={t('stepAddress.title')}
      info={recapText()}
      onEditRequest={accordionCtx.setStep}
    />
  )
}

export const StepAddress: React.FC<Props> = () => {
  const checkoutCtx = useContext(CheckoutContext)
  const accordionCtx = useContext(AccordionContext)

  const [isLocalLoader, setIsLocalLoader] = useState(false)

  if (!checkoutCtx || !accordionCtx) {
    return null
  }
  const {
    isShipmentRequired,
    billingAddress,
    shippingAddress,
    emailAddress,
    hasSameAddresses,
    isUsingNewBillingAddress,
    isUsingNewShippingAddress,
    hasCustomerAddresses,
    shippingCountryCodeLock,
    setAddresses,
    setCustomerEmail,
  } = checkoutCtx

  const [shipToDifferentAddress, setShipToDifferentAddress] = useState(
    !hasSameAddresses
  )

  useEffect(() => {
    setShipToDifferentAddress(!hasSameAddresses)
  }, [hasSameAddresses])

  const [disabledShipToDifferentAddress, setDisabledShipToDifferentAddress] =
    useState(
      !!(
        shippingCountryCodeLock &&
        billingAddress?.country_code &&
        billingAddress?.country_code !== shippingCountryCodeLock
      )
    )

  const openShippingAddress = ({
    forceShipping,
    disableToggle,
  }: ShippingToggleProps) => {
    if (forceShipping) {
      setShipToDifferentAddress(true)
    }
    setDisabledShipToDifferentAddress(disableToggle)
  }

  const handleSave = async (params: { success: boolean; order?: Order }) => {
    setIsLocalLoader(true)
    await setAddresses(params.order)

    // it is used temporarily to scroll
    // to the next step and fix
    // the mobile and desktop bug that led to the bottom of the page
    const tab = document.querySelector('div[tabindex="2"]')
    const top = tab?.scrollLeft as number
    const left = tab?.scrollTop as number
    window.scrollTo({ left, top, behavior: 'smooth' })

    setIsLocalLoader(false)

    // @TODO: proceed to License tab on click (is it something to do with these tabs?)
    console.log('tab: ', tab) // is undefined
  }

  return (
    <div
      className={classNames({
        current: accordionCtx.isActive,
        done: !accordionCtx.isActive,
        submitting: isLocalLoader,
      })}
    >
      <Box>
        <>
          {accordionCtx.isActive && (
            <>
              <CheckoutCustomerAddresses
                shippingAddress={shippingAddress}
                billingAddress={billingAddress}
                emailAddress={emailAddress}
                hasCustomerAddresses={hasCustomerAddresses}
                isShipmentRequired={isShipmentRequired}
                isUsingNewShippingAddress={isUsingNewShippingAddress}
                isUsingNewBillingAddress={isUsingNewBillingAddress}
                hasSameAddresses={hasSameAddresses}
                isLocalLoader={isLocalLoader}
                shippingCountryCodeLock={shippingCountryCodeLock}
                openShippingAddress={openShippingAddress}
                shipToDifferentAddress={shipToDifferentAddress}
                setShipToDifferentAddress={setShipToDifferentAddress}
                disabledShipToDifferentAddress={disabledShipToDifferentAddress}
                handleSave={handleSave}
              />
            </>
          )}
        </>
      </Box>
    </div>
  )
}

interface EvaluateConditionsProps {
  countryCode?: string
  shippingCountryCodeLock?: string
}

export function evaluateShippingToggle({
  countryCode,
  shippingCountryCodeLock,
}: EvaluateConditionsProps): ShippingToggleProps {
  if (
    !!shippingCountryCodeLock &&
    countryCode &&
    countryCode !== shippingCountryCodeLock
  ) {
    return { disableToggle: true, forceShipping: true }
  }
  return { disableToggle: false }
}
