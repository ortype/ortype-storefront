import {
  AddressProvider,
  useAddressState,
} from '@/commercelayer/providers/address'
import { CheckoutContext } from '@/commercelayer/providers/checkout'
import { Box, Button, useStepsContext } from '@chakra-ui/react'
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

// Container component that manages address submission with Proceed button
const StepAddressContainer: React.FC<{
  isShipmentRequired: boolean
  billingAddress: any
  openShippingAddress: (props: ShippingToggleProps) => void
}> = ({ isShipmentRequired, billingAddress, openShippingAddress }) => {
  const { billing } = useAddressState()
  const checkoutCtx = useContext(CheckoutContext)
  const stepsContext = useStepsContext()
  const { t } = useTranslation()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!checkoutCtx) {
    return null
  }

  const handleProceed = async () => {
    setIsLoading(true)
    setError(null)

    try {
      console.log('Address Proceed button clicked - saving address')
      const result = await checkoutCtx.saveAddress(billing, false) // useAsShipping = false by default

      if (result.success) {
        console.log('✅ Address saved successfully - checking context state:')
        console.log('hasBillingAddress:', checkoutCtx.hasBillingAddress)
        console.log('hasEmailAddress:', checkoutCtx.hasEmailAddress)
        console.log('isShipmentRequired:', checkoutCtx.isShipmentRequired)
        console.log('hasShippingAddress:', checkoutCtx.hasShippingAddress)

        // Advance to next step using Chakra UI Steps context
        if (stepsContext && stepsContext.goToNextStep) {
          console.log('🚀 Advancing to next step after successful address save')
          stepsContext.goToNextStep()
        } else {
          console.warn('⚠️ Steps context not available for step advancement')
        }
      } else {
        setError(result.error || 'Failed to save address')
      }
    } catch (error: any) {
      console.error('Error saving address:', error)
      setError(error?.message || 'Failed to save address')
    } finally {
      setIsLoading(false)
    }
  }

  const canProceed = billing && Object.keys(billing).length > 0

  return (
    <Box>
      <>
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

          {/* Proceed button within the address step */}
          <Box mt={6}>
            {error && (
              <Box color="red.500" fontSize="sm" mb={4}>
                {error}
              </Box>
            )}
            <Button
              onClick={handleProceed}
              loading={isLoading}
              disabled={!canProceed || isLoading}
              variant={'outline'}
              bg={'white'}
              borderRadius={'5rem'}
              size={'sm'}
              fontSize={'md'}
            >
              {isLoading
                ? 'Saving Address...'
                : isShipmentRequired
                ? t('stepAddress.continueToShipping', 'Proceed')
                : t('stepAddress.continueToLicense', 'Proceed')}
            </Button>
          </Box>
        </>
      </>
    </Box>
  )
}

export const StepAddress: React.FC<Props> = () => {
  const checkoutCtx = useContext(CheckoutContext)
  const { t } = useTranslation()

  // Removed isLocalLoader - no longer needed since SaveBillingAddressButton manages its own loading state

  if (!checkoutCtx) {
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

  // Removed handleSave - SaveBillingAddressButton now handles this directly

  return (
    <AddressProvider>
      <StepAddressContainer
        isShipmentRequired={isShipmentRequired}
        billingAddress={billingAddress}
        openShippingAddress={openShippingAddress}
      />
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
