import { AddressRadioCard } from '@/commercelayer/components/ui/address/address-radio-card'
import {
  AddressProvider,
  useAddressState,
} from '@/commercelayer/providers/address'
import { CheckoutContext } from '@/commercelayer/providers/checkout'
import { Alert } from '@/components/ui/alert'
import { RadioCardRoot } from '@/components/ui/radio-card'
import { setCustomerOrderParam } from '@/utils/localStorage'
import {
  Box,
  Button,
  Flex,
  Grid,
  GridItem,
  useStepsContext,
  VStack,
} from '@chakra-ui/react'
import type { Address } from '@commercelayer/sdk'
import { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CheckoutSummary } from '../checkout-summary'
import { AddressFormBottom } from './address-form-bottom'
import { BillingAddressDrawer } from './billing-address-drawer'
import { BillingAddressForm } from './billing-address-form'

interface Props {
  className?: string
  step?: number
}

export interface ShippingToggleProps {
  forceShipping?: boolean
  disableToggle: boolean
}

// Container component that manages address submission with Proceed button
const StepAddressContainer: React.FC<{
  isShipmentRequired: boolean
  billingAddress?: Address
  openShippingAddress: (props: ShippingToggleProps) => void
}> = ({ isShipmentRequired, billingAddress, openShippingAddress }) => {
  const { billing } = useAddressState()
  const checkoutCtx = useContext(CheckoutContext)
  const stepsContext = useStepsContext()
  const { t } = useTranslation()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedAddressId, setSelectedAddressId] = useState<string>()
  const [drawer, setDrawer] = useState<{
    address?: Address
    isAddressBook: boolean
  } | null>(null)

  const savedAddresses = (checkoutCtx?.customerAddresses ?? []).flatMap(
    ({ address }) => (address ? [address] : [])
  )
  const currentSavedAddress =
    billingAddress &&
    savedAddresses.find(
      (address) =>
        address.id === billingAddress.id ||
        address.id === billingAddress.reference ||
        (!!address.reference &&
          address.reference === billingAddress.reference)
    )
  const currentAddressId = currentSavedAddress?.id ?? billingAddress?.id
  const addresses =
    billingAddress && !currentSavedAddress
      ? [...savedAddresses, billingAddress]
      : savedAddresses

  useEffect(() => {
    setSelectedAddressId(currentAddressId)
  }, [currentAddressId])

  if (!checkoutCtx) {
    return null
  }

  const handleProceed = async () => {
    setIsLoading(true)
    setError(null)

    try {
      if (billingAddress) {
        if (!selectedAddressId) return
        if (selectedAddressId !== currentAddressId) {
          const result =
            await checkoutCtx.attachBillingAddressToOrder(selectedAddressId)
          if (!result.success) {
            setError('Failed to select billing address')
            return
          }
          setCustomerOrderParam(
            '_save_billing_address_to_customer_address_book',
            'false'
          )
        }
      } else {
        const result = await checkoutCtx.saveAddress(billing, false)
        if (!result.success) {
          setError(result.error || 'Failed to save address')
          return
        }
      }
      stepsContext.goToNextStep()
    } catch (error) {
      setError(
        error instanceof Error ? error.message : 'Failed to save address'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const canProceed = billingAddress
    ? !!selectedAddressId
    : Object.keys(billing).length > 0

  const colSpan = addresses ? (addresses?.length % 2 === 1 ? 1 : 2) : 2

  return (
    <VStack gap={2} mb={4} align={'start'} w={'full'}>
      <Box
        px={3}
        fontSize={'xs'}
        textTransform={'uppercase'}
        color={'#737373'}
        mb={0}
        asChild
      >
        <Flex gap={1} alignItems={'center'}>
          {'Billing address'}
        </Flex>
      </Box>
      {billingAddress ? (
        <>
          <Grid
            templateColumns={'1fr 1fr'}
            gridGap={2}
            w={'full'}
            mb={2}
            asChild
          >
            <RadioCardRoot
              aria-label='Billing address'
              value={selectedAddressId}
              onValueChange={({ value }) => {
                setSelectedAddressId(value || undefined)
                setError(null)
              }}
              variant='solid'
              size='md'
              disabled={isLoading}
            >
              {addresses.map((address) => (
                <AddressRadioCard
                  key={address.id}
                  address={address}
                  selected={selectedAddressId === address.id}
                  disabled={isLoading}
                  onEdit={() => {
                    setError(null)
                    setDrawer({
                      address,
                      isAddressBook: savedAddresses.some(
                        (saved) => saved.id === address.id
                      ),
                    })
                  }}
                />
              ))}
              <GridItem
                bg={'brand.50'}
                p={4}
                minH={24}
                h={'full'}
                pos={'relative'}
                justifyContent={'center'}
                alignItems={'center'}
                colSpan={colSpan}
                asChild
              >
                <Button
                  type='button'
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
                  disabled={isLoading}
                  onClick={() => {
                    setError(null)
                    setDrawer({ isAddressBook: false })
                  }}
                >
                  {'New billing address'}
                </Button>
              </GridItem>
            </RadioCardRoot>
          </Grid>

          {drawer && (
            <BillingAddressDrawer
              {...drawer}
              openShippingAddress={openShippingAddress}
              onClose={() => setDrawer(null)}
              onSaved={(addressId) => {
                setSelectedAddressId(addressId)
                setDrawer(null)
              }}
            />
          )}
        </>
      ) : (
        <>
          <BillingAddressForm openShippingAddress={openShippingAddress} />
          <AddressFormBottom
            addressType={'billing'}
            hasCustomerAddresses={false}
          />
        </>
      )}
      {/* TODO: Replace with shipping address form when implementing shipping flow
       * See SHIPPING_MIGRATION_TODO.md for complete implementation plan
       * Components needed:
       * - shipping-address-form-new/index.tsx
       * - Update AddressProvider for shipping state
       * - Add shipping validation and save logic
       */}
      {isShipmentRequired && (
        <div className='mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded'>
          <p className='text-yellow-800'>
            Shipping address form - TODO: Implement
          </p>
          <p className='text-sm text-yellow-600 mt-2'>
            See SHIPPING_MIGRATION_TODO.md for implementation details
          </p>
        </div>
      )}

      {/* Proceed button within the address step */}
      <Flex w={'full'} direction={'column'} gap={2}>
        {error && (
          <Alert status='error' my='4'>
            {error}
          </Alert>
        )}
        <Button
          type='button'
          onClick={handleProceed}
          loading={isLoading}
          disabled={!canProceed || isLoading}
          alignSelf='flex-end'
          variant={'outline'}
          bg={'white'}
          borderRadius={'5rem'}
          size={'xs'}
          fontSize={'md'}
          _hover={{
            bg: 'black',
            color: 'white',
          }}
        >
          {isLoading
            ? 'Saving Address...'
            : isShipmentRequired
              ? t('stepAddress.continueToShipping', 'Proceed')
              : t('stepAddress.continueToLicense', 'Proceed')}
        </Button>
      </Flex>
    </VStack>
  )
}

export const StepAddress: React.FC<Props> = () => {
  const checkoutCtx = useContext(CheckoutContext)
  const { t } = useTranslation()

  const {
    isShipmentRequired = false,
    billingAddress,
    hasSameAddresses,
    shippingCountryCodeLock,
  } = checkoutCtx ?? {}

  const [shipToDifferentAddress, setShipToDifferentAddress] =
    useState(!hasSameAddresses)

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

  if (!checkoutCtx) {
    return null
  }

  return (
    <VStack gap={2} align='start' w='full'>
      <CheckoutSummary
        showEmail={true}
        showBillingAddress={false}
        showLicenseOwner={false}
        heading={t('stepPayment.summaryHeading', 'Your Details')}
      />
      <AddressProvider>
        <StepAddressContainer
          isShipmentRequired={isShipmentRequired}
          billingAddress={billingAddress}
          openShippingAddress={openShippingAddress}
        />
      </AddressProvider>
    </VStack>
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
