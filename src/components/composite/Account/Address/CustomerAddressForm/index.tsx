import { AddressInputGroup } from '@/components/composite/Account/Address/address-input-group'
import { CustomerAddressContext } from '@/components/data/CustomerAddressProvider'
import {
  Button,
  Container,
  Flex,
  Grid,
  Heading,
  SimpleGrid,
  Text,
} from '@chakra-ui/react'
import { BillingAddressForm } from '@commercelayer/react-components/addresses/BillingAddressForm'
import { SaveAddressesButton } from '@commercelayer/react-components/addresses/SaveAddressesButton'
import { useRouter } from 'next/navigation'
import { XCircle } from 'phosphor-react'
import { useContext } from 'react'
import { useTranslation } from 'react-i18next'

function CustomerAddressForm({
  addressId,
}: {
  addressId: string
}): JSX.Element | null {
  const ctx = useContext(CustomerAddressContext)
  const { t } = useTranslation()
  const address = ctx?.address
  const router = useRouter()

  console.log('CustomerAddressForm: Context: ', { address })

  return address === undefined && addressId !== undefined ? null : (
    <Container maxW={'lg'}>
      <BillingAddressForm>
        <Heading>
          {addressId === undefined
            ? t('addresses.addressForm.new_address_title')
            : t('addresses.addressForm.edit_address_title')}
        </Heading>
        <SimpleGrid columns={2} gap={4}>
          <AddressInputGroup
            fieldName="billing_address_first_name"
            type="text"
            value={address?.first_name || ''}
          />
          <AddressInputGroup
            fieldName="billing_address_last_name"
            type="text"
            value={address?.last_name || ''}
          />
        </SimpleGrid>
        <SimpleGrid columns={1}>
          <AddressInputGroup
            fieldName="billing_address_line_1"
            type="text"
            value={address?.line_1 || ''}
          />
          <AddressInputGroup
            required={false}
            fieldName="billing_address_line_2"
            type="text"
            value={address?.line_2 || ''}
          />
        </SimpleGrid>
        <SimpleGrid columns={2} gap={4}>
          <AddressInputGroup
            fieldName="billing_address_city"
            type="text"
            value={address?.city || ''}
          />
          <AddressInputGroup
            fieldName="billing_address_country_code"
            type="text"
            value={address?.country_code || ''}
          />
        </SimpleGrid>
        <SimpleGrid columns={2} gap={4}>
          <AddressInputGroup
            fieldName="billing_address_state_code"
            type="text"
            value={address?.state_code || ''}
          />
          <AddressInputGroup
            fieldName="billing_address_zip_code"
            type="text"
            value={address?.zip_code || ''}
          />
        </SimpleGrid>
        <AddressInputGroup
          fieldName="billing_address_phone"
          type="tel"
          value={address?.phone || ''}
        />
        <AddressInputGroup
          required={false}
          fieldName="billing_address_billing_info"
          type="text"
          value={address?.billing_info || ''}
        />
        <Flex alignItems={'center'} justifyContent={'flex-end'} pb={5}>
          <Button
            onClick={() => {
              router.push('/account/addresses')
            }}
          >
            <XCircle className="w-4 h-4" />
            <Text>{t('addresses.addressForm.discard_changes')}</Text>
          </Button>
          <SaveAddressesButton
            data-test-id="save-address"
            label={t('addresses.addressForm.save')}
            onClick={() => {
              // router.push(`/account/addresses`)
              console.log('SaveAddressesButton clicked')
            }}
            addressId={address?.id}
          />
        </Flex>
      </BillingAddressForm>
    </Container>
  )
}

export default CustomerAddressForm
