import { Address } from '@commercelayer/sdk'
import { useContext, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import {
  evaluateShippingToggle,
  ShippingToggleProps,
} from '@/commercelayer/components/pages/checkout/step-address'
import { AddressInputGroup } from '@/commercelayer/components/ui/address/address-input-group'
import {
  useAddressActions,
  useAddressState,
} from '@/commercelayer/providers/address'
import { CheckoutContext } from '@/commercelayer/providers/checkout'
import { Box, Grid, Stack } from '@chakra-ui/react'

interface Props {
  billingAddress?: Address
  openShippingAddress: (props: ShippingToggleProps) => void
}

export const BillingAddressForm: React.FC<Props> = ({
  billingAddress,
  openShippingAddress,
}: Props) => {
  const { t } = useTranslation()
  const { billing, errors } = useAddressState()
  const { updateBillingAddressData } = useAddressActions()
  const checkoutCtx = useContext(CheckoutContext)

  if (!checkoutCtx) {
    return null
  }

  const { requiresBillingInfo, shippingCountryCodeLock } = checkoutCtx

  // Initialize billing address data from props
  useEffect(() => {
    if (billingAddress) {
      updateBillingAddressData({
        first_name: billingAddress.first_name || '',
        last_name: billingAddress.last_name || '',
        line_1: billingAddress.line_1 || '',
        line_2: billingAddress.line_2 || '',
        city: billingAddress.city || '',
        country_code: billingAddress.country_code || '',
        state_code: billingAddress.state_code || '',
        zip_code: billingAddress.zip_code || '',
        phone: billingAddress.phone || '',
        billing_info: billingAddress.billing_info || '',
      })
    }
  }, [billingAddress, updateBillingAddressData])

  // Create a unified change handler for AddressInputGroup components
  const handleAddressInputChange = (fieldName: string, value: string) => {
    switch (fieldName) {
      case 'billing_address_first_name':
        updateBillingAddressData({ first_name: value })
        break
      case 'billing_address_last_name':
        updateBillingAddressData({ last_name: value })
        break
      case 'billing_address_line_1':
        updateBillingAddressData({ line_1: value })
        break
      case 'billing_address_line_2':
        updateBillingAddressData({ line_2: value })
        break
      case 'billing_address_city':
        updateBillingAddressData({ city: value })
        break
      case 'billing_address_country_code':
        updateBillingAddressData({ country_code: value })
        break
      case 'billing_address_state_code':
        updateBillingAddressData({ state_code: value })
        break
      case 'billing_address_zip_code':
        updateBillingAddressData({ zip_code: value })
        break
      case 'billing_address_phone':
        updateBillingAddressData({ phone: value })
        break
      case 'billing_address_billing_info':
        updateBillingAddressData({ billing_info: value })
        break
    }
  }

  return (
    <>
      <Stack gap={1} w={'full'}>
        <Grid templateColumns="repeat(2, 1fr)" gap={1}>
          <AddressInputGroup
            fieldName="billing_address_first_name"
            resource="billing_address"
            type="text"
            value={billing.first_name || billingAddress?.first_name || ''}
            onChange={handleAddressInputChange}
            required
          />

          <AddressInputGroup
            fieldName="billing_address_last_name"
            resource="billing_address"
            type="text"
            value={billing.last_name || billingAddress?.last_name || ''}
            onChange={handleAddressInputChange}
            required
          />
        </Grid>

        <AddressInputGroup
          fieldName="billing_address_line_1"
          resource="billing_address"
          type="text"
          value={billing.line_1 || billingAddress?.line_1 || ''}
          onChange={handleAddressInputChange}
          required
        />

        <AddressInputGroup
          fieldName="billing_address_line_2"
          resource="billing_address"
          type="text"
          value={billing.line_2 || billingAddress?.line_2 || ''}
          onChange={handleAddressInputChange}
        />

        <Grid templateColumns="repeat(2, 1fr)" gap={1}>
          <AddressInputGroup
            fieldName="billing_address_country_code"
            resource="billing_address"
            type="text"
            value={billing.country_code || billingAddress?.country_code || ''}
            onChange={handleAddressInputChange}
            openShippingAddress={openShippingAddress}
            required
          />

          <AddressInputGroup
            fieldName="billing_address_state_code"
            resource="billing_address"
            type="text"
            value={billing.state_code || billingAddress?.state_code || ''}
            onChange={handleAddressInputChange}
            countryCode={
              billing.country_code || billingAddress?.country_code || ''
            }
            required
          />
        </Grid>

        <Grid templateColumns="repeat(2, 1fr)" gap={1}>
          <AddressInputGroup
            fieldName="billing_address_city"
            resource="billing_address"
            type="text"
            value={billing.city || billingAddress?.city || ''}
            onChange={handleAddressInputChange}
            required
          />

          <AddressInputGroup
            fieldName="billing_address_zip_code"
            resource="billing_address"
            type="text"
            value={billing.zip_code || billingAddress?.zip_code || ''}
            onChange={handleAddressInputChange}
            required
          />
        </Grid>

        <AddressInputGroup
          fieldName="billing_address_phone"
          resource="billing_address"
          type="tel"
          value={billing.phone || billingAddress?.phone || ''}
          onChange={handleAddressInputChange}
        />

        {requiresBillingInfo && (
          <AddressInputGroup
            fieldName="billing_address_billing_info"
            resource="billing_address"
            type="text"
            value={billing.billing_info || billingAddress?.billing_info || ''}
            onChange={handleAddressInputChange}
          />
        )}
      </Stack>
    </>
  )
}
