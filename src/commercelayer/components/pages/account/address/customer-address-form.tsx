import { AddressInputGroup } from '@/commercelayer/components/ui/address'
import { useAddressesContext } from '@/commercelayer/providers/addresses'
import { CustomerAddressContext } from '@/commercelayer/providers/customer-address'
import {
  Box,
  Button,
  Card,
  Flex,
  Heading,
  SimpleGrid,
  VStack,
} from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import { useCallback, useContext, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import SaveAddressesButton from './save-addresses-button'

function CustomerAddressForm({
  addressId,
}: {
  addressId?: string
}): JSX.Element | null {
  const ctx = useContext(CustomerAddressContext)
  const {
    setAddress,
    billing_address: billingAddress,
    isBusiness,
  } = useAddressesContext()
  const { t } = useTranslation()
  const address = ctx?.address
  const router = useRouter()

  // When editing, seed AddressesContext with the fetched address so that
  // fields the user hasn't touched are still included on save.
  useEffect(() => {
    if (address) {
      setAddress({
        values: {
          first_name: address.first_name || '',
          last_name: address.last_name || '',
          line_1: address.line_1 || '',
          line_2: address.line_2 || '',
          city: address.city || '',
          country_code: address.country_code || '',
          state_code: address.state_code || '',
          zip_code: address.zip_code || '',
          phone: address.phone || '',
          billing_info: address.billing_info || '',
        },
        resource: 'billing_address',
      })
    }
  }, [address])

  // Mirror the checkout billing-address-form pattern:
  // each AddressInputGroup calls onChange(fieldName, value) on change,
  // and we push the stripped field into AddressesContext.
  // We spread the existing billingAddress so the reducer doesn't discard
  // previously entered fields (it replaces the whole object).
  const handleAddressInputChange = useCallback(
    (fieldName: string, value: string) => {
      console.log('handleAddressInputChange: ', { fieldName, value })

      const key = fieldName.replace('billing_address_', '')
      setAddress({
        values: {
          ...billingAddress,
          [key]: value,
          ...(isBusiness && { business: isBusiness }),
        },
        resource: 'billing_address',
      })
    },
    [setAddress, billingAddress, isBusiness]
  )

  // @TODO: on mount focus on the first input

  return address === undefined && addressId !== undefined ? null : (
    <>
      <form autoComplete={'off'}>
        <Box
          px={3}
          fontSize={'xs'}
          textTransform={'uppercase'}
          color={'#737373'}
          mb={2}
          mt={2}
          asChild
        >
          <Flex gap={1} alignItems={'center'}>
            {addressId === undefined
              ? t('addresses.addressForm.new_address_title')
              : t('addresses.addressForm.edit_address_title')}
          </Flex>
        </Box>

        {/*<Heading
          as={'h5'}
          fontSize={'xl'}
          textTransform={'uppercase'}
          fontWeight={'normal'}
        >
          {addressId === undefined
            ? t('addresses.addressForm.new_address_title')
            : t('addresses.addressForm.edit_address_title')}
        </Heading>*/}

        <VStack gap={2} alignItems={'flex-start'}>
          <SimpleGrid w={'full'} columns={2} gap={2}>
            <AddressInputGroup
              fieldName="billing_address_first_name"
              type="text"
              resource="billing_address"
              value={address?.first_name || ''}
              onChange={handleAddressInputChange}
            />
            <AddressInputGroup
              fieldName="billing_address_last_name"
              type="text"
              resource="billing_address"
              value={address?.last_name || ''}
              onChange={handleAddressInputChange}
            />
          </SimpleGrid>
          <AddressInputGroup
            fieldName="billing_address_line_1"
            type="text"
            resource="billing_address"
            value={address?.line_1 || ''}
            onChange={handleAddressInputChange}
          />
          <AddressInputGroup
            required={false}
            fieldName="billing_address_line_2"
            type="text"
            resource="billing_address"
            value={address?.line_2 || ''}
            onChange={handleAddressInputChange}
          />
          <SimpleGrid w={'full'} columns={2} gap={2}>
            <AddressInputGroup
              fieldName="billing_address_city"
              type="text"
              resource="billing_address"
              value={address?.city || ''}
              onChange={handleAddressInputChange}
            />
            <AddressInputGroup
              fieldName="billing_address_country_code"
              type="text"
              resource="billing_address"
              value={address?.country_code || ''}
              onChange={handleAddressInputChange}
            />
          </SimpleGrid>
          <SimpleGrid w={'full'} columns={2} gap={2}>
            <AddressInputGroup
              fieldName="billing_address_state_code"
              type="text"
              resource="billing_address"
              value={address?.state_code || ''}
              onChange={handleAddressInputChange}
            />
            <AddressInputGroup
              fieldName="billing_address_zip_code"
              type="text"
              resource="billing_address"
              value={address?.zip_code || ''}
              onChange={handleAddressInputChange}
            />
          </SimpleGrid>
          <AddressInputGroup
            fieldName="billing_address_phone"
            type="tel"
            // @TODO: allow only numeric input with javascript
            resource="billing_address"
            value={address?.phone || ''}
            onChange={handleAddressInputChange}
          />
          <AddressInputGroup
            required={false}
            fieldName="billing_address_billing_info"
            type="text"
            resource="billing_address"
            value={address?.billing_info || ''}
            onChange={handleAddressInputChange}
          />
          <Flex justifyContent={'flex-end'} my={2} w={'full'} gap={2}>
            <Button
              onClick={() => {
                router.push('/account/addresses')
              }}
              variant={'outline'}
              bg={'white'}
              borderRadius={'5rem'}
              size={'sm'}
              fontSize={'md'}
            >
              {t('addresses.addressForm.discard_changes')}
            </Button>

            <SaveAddressesButton
              data-test-id="save-address"
              label={t('addresses.addressForm.save')}
              onClick={() => {
                router.push(`/account/addresses`)
              }}
              addressId={address?.id}
            />
          </Flex>
        </VStack>
      </form>
    </>
  )
}

export default CustomerAddressForm
