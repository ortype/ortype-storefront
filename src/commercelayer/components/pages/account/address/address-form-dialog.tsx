import CustomerAddressForm from '@/commercelayer/components/pages/account/address/customer-address-form'
import AddressesContainer from '@/commercelayer/providers/addresses'
import { CustomerAddressProvider } from '@/commercelayer/providers/customer-address'
import { useIdentityContext } from '@/commercelayer/providers/identity'
import { useTranslation } from 'react-i18next'

import {
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@chakra-ui/react'
import { useState } from 'react'
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
    <DialogRoot
      lazyMount
      size={'lg'}
      open={open}
      onOpenChange={(e) => {
        setOpen(e.open)
      }}
      placement={'center'}
    >
      <DialogContent borderRadius={'2rem'}>
        <DialogHeader>
          <DialogTitle
            textAlign={'center'}
            fontSize={'2rem'}
            fontWeight={'normal'}
            textTransform={'uppercase'}
            mx={'auto'}
            pb={4}
          >
            {addressId === undefined
              ? t('addresses.addressForm.new_address_title')
              : t('addresses.addressForm.edit_address_title')}
          </DialogTitle>
        </DialogHeader>
        <DialogBody>
          <CustomerAddressProvider
            accessToken={settings?.accessToken as string}
            domain={config?.domain as string}
            slug={config?.slug as string}
            addressId={addressId}
          >
            <AddressesContainer>
              <CustomerAddressForm
                addressId={addressId}
                closeButton={
                  <Button
                    onClick={handleClose}
                    variant={'outline'}
                    bg={'white'}
                    borderRadius={'5rem'}
                    size={'sm'}
                    fontSize={'md'}
                  >
                    {t('addresses.addressForm.discard_changes')}
                  </Button>
                }
                saveButton={
                  <SaveAddressesButton
                    data-test-id="save-address"
                    label={t('addresses.addressForm.save')}
                    onClick={handleClose}
                    addressId={addressId}
                  />
                }
              />
            </AddressesContainer>
          </CustomerAddressProvider>
        </DialogBody>
      </DialogContent>
    </DialogRoot>
  )
}
