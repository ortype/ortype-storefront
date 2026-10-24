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
import {
  DrawerBackdrop,
  DrawerBody,
  DrawerCancel,
  DrawerCloseTrigger,
  DrawerConfirm,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerRoot,
  DrawerTitle,
} from '@/components/ui/drawer'
import {
  getSaveBillingAddressToAddressBook,
  setCustomerOrderParam,
} from '@/utils/localStorage'
import { Fieldset, HStack } from '@chakra-ui/react'
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

      const saveToAddressBook =
        !isAddressBook && getSaveBillingAddressToAddressBook()
      let selectedAddressId: string
      if (address && !saveToAddressBook) {
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
        // Create a separate source address before replacing the order clone.
        // This also promotes an order-only address into the customer's book.
        const result = await checkoutCtx.saveAddress(
          billing,
          false,
          saveToAddressBook
        )
        if (!result.success || !result.order?.billing_address) {
          setError(result.error || 'Failed to save address')
          return
        }
        selectedAddressId = saveToAddressBook
          ? result.order.billing_address.reference ||
            result.order.billing_address.id
          : result.order.billing_address.id
      }

      setCustomerOrderParam(
        '_save_billing_address_to_customer_address_book',
        'false'
      )
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
    <DrawerRoot
      open
      closeOnEscape={!isLoading}
      closeOnInteractOutside={!isLoading}
      onOpenChange={({ open }) => {
        if (!open && !isLoading) handleCancel()
      }}
    >
      <DrawerBackdrop />
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>
            {address ? 'Edit billing address' : 'New billing address'}
          </DrawerTitle>
          <DrawerCloseTrigger />
        </DrawerHeader>
        <DrawerBody>
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
            {!isAddressBook && (
              <AddressFormBottom
                variant={'white'}
                addressType='billing'
                hasCustomerAddresses={false}
              />
            )}
            {error && <Alert status='error'>{error}</Alert>}
            <HStack mt={2} gap={2} w='full' justify={'flex-end'}>
              <DrawerCancel disabled={isLoading} onClick={handleCancel}>
                {'Cancel'}
              </DrawerCancel>
              <DrawerConfirm loading={isLoading} onClick={handleSave}>
                {'Save address'}
              </DrawerConfirm>
            </HStack>
          </Fieldset.Root>
        </DrawerBody>
        <DrawerFooter></DrawerFooter>
      </DrawerContent>
    </DrawerRoot>
  )
}

export const BillingAddressDrawer = (props: Props) => (
  <AddressProvider>
    <BillingAddressDrawerContent {...props} />
  </AddressProvider>
)
