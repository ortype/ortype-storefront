import CustomerAddressForm from '@/commercelayer/components/pages/account/address/customer-address-form'
import AddressesContainer from '@/commercelayer/providers/addresses'
import { CustomerAddressProvider } from '@/commercelayer/providers/customer-address'
import { useIdentityContext } from '@/commercelayer/providers/identity'
import { useTranslation } from 'react-i18next'

import { CloseButton } from '@/components/ui/close-button'
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button, Drawer, Portal } from '@chakra-ui/react'
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
    <Drawer.Root
      lazyMount
      open={open}
      onOpenChange={(e) => {
        setOpen(e.open)
      }}
      size={'md'}
      // initialFocusEl={() => ref.current}
    >
      <Portal>
        <Drawer.Backdrop css={{ backdropFilter: 'blur(5px)' }} />
        <Drawer.Positioner
        // p={10}
        >
          <Drawer.Content
            rounded={0}
            // rounded={40}
            p={4}
            bg={'#e7e7e7'}
          >
            <Drawer.CloseTrigger
              position={'absolute'}
              top={'1rem'}
              left={'-4rem'}
              asChild
            >
              <CloseButton size='2xl' />
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
                {addressId === undefined
                  ? t('addresses.addressForm.new_address_title')
                  : t('addresses.addressForm.edit_address_title')}
              </Drawer.Title>
            </Drawer.Header>
            <Drawer.Body>
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
                      <Button
                        onClick={handleClose}
                        variant='text'
                        size='xs'
                        fontSize='xs'
                        px={2}
                        py={1}
                        h='auto'
                        minH='auto'
                      >
                        {t('addresses.addressForm.discard_changes')}
                      </Button>
                    }
                    saveButton={
                      <SaveAddressesButton
                        data-test-id='save-address'
                        label={t('addresses.addressForm.save')}
                        onClick={handleClose}
                        addressId={addressId}
                      />
                    }
                  />
                </AddressesContainer>
              </CustomerAddressProvider>
            </Drawer.Body>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  )
}
