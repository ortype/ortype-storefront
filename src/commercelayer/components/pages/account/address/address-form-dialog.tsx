import CustomerAddressForm from '@/commercelayer/components/pages/account/address/customer-address-form'
import AddressesContainer from '@/commercelayer/providers/addresses'
import { CustomerAddressProvider } from '@/commercelayer/providers/customer-address'
import { useIdentityContext } from '@/commercelayer/providers/identity'
import { useTranslation } from 'react-i18next'

import {
  DrawerBackdrop,
  DrawerBody,
  DrawerCancel,
  DrawerCloseTrigger,
  DrawerConfirm,
  DrawerContent,
  DrawerHeader,
  DrawerRoot,
  DrawerTitle,
} from '@/components/ui/drawer'
import SaveAddressesButton from './save-addresses-button'

export default function AddressFormDialog({
  addressId,
  open,
  setOpen,
}: {
  open: boolean
  setOpen: (boolean: boolean) => void
  addressId?: string
}) {
  const { isLoading, settings, config } = useIdentityContext()
  const { t } = useTranslation()

  const handleClose = () => {
    setOpen(false)
  }

  if (isLoading || !settings) return <div />

  return (
    <DrawerRoot
      lazyMount
      open={open}
      onOpenChange={(e) => {
        setOpen(e.open)
      }}
    >
      <DrawerBackdrop />
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>
            {addressId === undefined
              ? t('addresses.addressForm.new_address_title')
              : t('addresses.addressForm.edit_address_title')}
          </DrawerTitle>
          <DrawerCloseTrigger />
        </DrawerHeader>
        <DrawerBody>
          <CustomerAddressProvider
            accessToken={settings?.accessToken as string}
            domain={config?.domain as string}
            slug={config?.slug as string}
            addressId={addressId}
          >
            <AddressesContainer>
              <CustomerAddressForm
                addressId={addressId}
                variant={'white'}
                closeButton={
                  <DrawerCancel onClick={handleClose}>
                    {t('addresses.addressForm.discard_changes')}
                  </DrawerCancel>
                }
                saveButton={
                  <DrawerConfirm asChild>
                    <SaveAddressesButton
                      data-test-id='save-address'
                      label={t('addresses.addressForm.save')}
                      onClick={handleClose}
                      addressId={addressId}
                    />
                  </DrawerConfirm>
                }
              />
            </AddressesContainer>
          </CustomerAddressProvider>
        </DrawerBody>
      </DrawerContent>
    </DrawerRoot>
  )
}
