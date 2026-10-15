import {
  AddressProvider,
  useAddressState,
} from '@/commercelayer/providers/address'
import { useCheckoutContext } from '@/commercelayer/providers/checkout'
import {
  transformAddressErrors,
  validateAddress,
} from '@/commercelayer/utils/address'
import { Alert } from '@/components/ui/alert'
import { CloseButton } from '@/components/ui/close-button'
import {
  getSaveBillingAddressToAddressBook,
  setCustomerOrderParam,
} from '@/utils/localStorage'
import {
  Button,
  Drawer,
  Fieldset,
  Flex,
  HStack,
  Portal,
} from '@chakra-ui/react'
import type { Address } from '@commercelayer/sdk'
import { useState } from 'react'
import type { ShippingToggleProps } from '.'
import { AddressFormBottom } from './address-form-bottom'
import { BillingAddressForm } from './billing-address-form'

interface Props {
  address?: Address
  isAddressBook: boolean
  openShippingAddress: (props: ShippingToggleProps) => void
  onClose: () => void
  onSaved: (addressId: string) => void
}

const BillingAddressDrawerContent = ({
  address,
  isAddressBook,
  openShippingAddress,
  onClose,
  onSaved,
}: Props) => {
  const checkoutCtx = useCheckoutContext()
  const { billing } = useAddressState()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [initialSaveToBook] = useState(getSaveBillingAddressToAddressBook)

  const handleCancel = () => {
    setCustomerOrderParam(
      '_save_billing_address_to_customer_address_book',
      initialSaveToBook ? 'true' : 'false'
    )
    onClose()
  }

  const handleSave = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const validation = validateAddress({ addressData: billing })
      if (!validation.success) {
        const { fieldErrors, generalErrors } = transformAddressErrors(
          validation.error
        )
        setError(
          [
            ...fieldErrors.map(
              ({ field, message }) => `${field}: ${message}`
            ),
            ...generalErrors,
          ].join(', ')
        )
        return
      }

      let selectedAddressId: string
      if (address) {
        const updated = await checkoutCtx.updateBillingAddress(address.id, {
          ...billing,
          id: address.id,
        })
        if (!updated.success) {
          setError('Failed to update address')
          return
        }
        const attached = await checkoutCtx.attachBillingAddressToOrder(
          address.id
        )
        if (!attached.success || !attached.data?.billing_address) {
          setError(
            'Address updated, but could not be applied to checkout. Please retry.'
          )
          return
        }
        selectedAddressId = isAddressBook
          ? address.id
          : attached.data.billing_address.id
      } else {
        const result = await checkoutCtx.saveAddress(billing, false, true)
        if (!result.success || !result.order?.billing_address) {
          setError(result.error || 'Failed to save address')
          return
        }
        selectedAddressId =
          result.order.billing_address.reference ||
          result.order.billing_address.id
      }

      if (isAddressBook || !address) {
        setCustomerOrderParam(
          '_save_billing_address_to_customer_address_book',
          'false'
        )
      }
      onSaved(selectedAddressId)
    } catch (error) {
      setError(
        error instanceof Error ? error.message : 'Failed to save address'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Drawer.Root
      open
      size={'md'}
      closeOnEscape={!isLoading}
      closeOnInteractOutside={!isLoading}
      onOpenChange={({ open }) => {
        if (!open && !isLoading) handleCancel()
      }}
    >
      <Portal>
        <Drawer.Backdrop css={{ backdropFilter: 'blur(5px)' }} />
        <Drawer.Positioner>
          <Drawer.Content rounded={0} p={4} bg={'#e7e7e7'}>
            <Drawer.CloseTrigger
              position={'absolute'}
              top={'1rem'}
              left={'-4rem'}
              asChild
            >
              <CloseButton size='2xl' disabled={isLoading} />
            </Drawer.CloseTrigger>
            <Drawer.Header pt={2} pb={3}>
              <Drawer.Title
                fontSize={'2rem'}
                fontWeight={'normal'}
                textTransform={'uppercase'}
                lineHeight={1}
                pb={3}
                borderBottom={'1px solid #919191'}
              >
                {address ? 'Edit billing address' : 'New billing address'}
              </Drawer.Title>
            </Drawer.Header>
            <Drawer.Body>
              <Fieldset.Root
                disabled={isLoading}
                alignItems='stretch'
                gap={2}
                border={0}
                p={0}
                m={0}
                minW={0}
              >
                <BillingAddressForm
                  billingAddress={address}
                  openShippingAddress={openShippingAddress}
                  variant={'white'}
                />
                {address && !isAddressBook && (
                  <AddressFormBottom
                    variant={'white'}
                    addressType='billing'
                    hasCustomerAddresses={false}
                  />
                )}
                {error && <Alert status='error'>{error}</Alert>}
                <HStack mt={2} gap={2} w='full' justify={'flex-end'}>
                  <Button
                    type='button'
                    variant='text'
                    size='xs'
                    fontSize='xs'
                    px={2}
                    py={1}
                    h='auto'
                    minH='auto'
                    disabled={isLoading}
                    onClick={handleCancel}
                  >
                    {'Cancel'}
                  </Button>
                  <Button
                    alignSelf='flex-end'
                    variant={'solid'}
                    bg={'black'}
                    color={'white'}
                    borderRadius={'5rem'}
                    border={'2px solid #000'}
                    size={'sm'}
                    fontSize={'md'}
                    gap={1}
                    _hover={{
                      bg: 'transparent',
                      color: 'colorPalette.fg',
                    }}
                    loading={isLoading}
                    onClick={handleSave}
                  >
                    {'Save address'}
                  </Button>
                </HStack>
              </Fieldset.Root>
            </Drawer.Body>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  )
}

export const BillingAddressDrawer = (props: Props) => (
  <AddressProvider>
    <BillingAddressDrawerContent {...props} />
  </AddressProvider>
)
