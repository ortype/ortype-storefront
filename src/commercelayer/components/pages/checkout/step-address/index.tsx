import SaveBillingAddressButton from '@/commercelayer/components/ui/save-billing-address-button'
import { AccordionContext } from '@/commercelayer/providers/accordion'
import { AddressProvider } from '@/commercelayer/providers/address'
import { CheckoutContext } from '@/commercelayer/providers/checkout'
import { StepContainer } from '@/components/ui/StepContainer'
import { StepHeader } from '@/components/ui/StepHeader'
import { Box } from '@chakra-ui/react'
import type { Order } from '@commercelayer/sdk'
import classNames from 'classnames'
import { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BillingAddressForm } from './billing-address-form'

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
  const { t } = useTranslation()

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
    setIsLocalLoader(false)
  }

  return (
    <AddressProvider>
      <StepContainer
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
                <BillingAddressForm
                  billingAddress={billingAddress}
                  openShippingAddress={openShippingAddress}
                />
                {/* TODO: Replace with shipping address form when implementing shipping flow
                 * See SHIPPING_MIGRATION_TODO.md for complete implementation plan
                 * Components needed:
                 * - shipping-address-form-new/index.tsx
                 * - Update AddressProvider for shipping state
                 * - Add shipping validation and save logic
                 */}
                {isShipmentRequired && (
                  <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-yellow-800">
                      Shipping address form - TODO: Implement
                    </p>
                    <p className="text-sm text-yellow-600 mt-2">
                      See SHIPPING_MIGRATION_TODO.md for implementation details
                    </p>
                  </div>
                )}
                <SaveBillingAddressButton
                  label={
                    isShipmentRequired
                      ? t('stepCustomer.continueToDelivery')
                      : t('stepAddress.continueToLicense')
                  }
                  data-test-id="save-customer-button"
                  onClick={() => handleSave({ success: true })}
                  orderId={checkoutCtx.order?.id}
                />
              </>
            )}
          </>
        </Box>
      </StepContainer>
    </AddressProvider>
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
