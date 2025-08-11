import { Address } from '@commercelayer/sdk'
import { useContext, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import {
  evaluateShippingToggle,
  ShippingToggleProps,
} from '@/commercelayer/components/pages/checkout/step-address'
import {
  useAddressActions,
  useAddressState,
} from '@/commercelayer/providers/address'
import { CheckoutContext } from '@/commercelayer/providers/checkout'
import { Box, Grid } from '@chakra-ui/react'
import { AddressField, CountrySelect, StateSelect } from '@/commercelayer/components/ui/address'

interface Props {
  billingAddress?: Address
  openShippingAddress: (props: ShippingToggleProps) => void
}

// Simple error display component to replace Errors
const ErrorDisplay = ({ message }: { message?: string }) => {
  if (!message) return null
  return <div className="text-red-500 text-sm mt-1">{message}</div>
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

  // Handle country change to evaluate shipping toggle
  const handleCountryChange = (countryCode: string) => {
    updateBillingAddressData({ country_code: countryCode })
    const toggleProps = evaluateShippingToggle({
      countryCode,
      shippingCountryCodeLock,
    })
    openShippingAddress(toggleProps)
  }

  // Handle state change
  const handleStateChange = (stateCode: string) => {
    updateBillingAddressData({ state_code: stateCode })
  }

  return (
    <>
      <Grid>
        <div className="mb-8">
          <Box>
            <div className="relative h-10">
              <AddressField
                id="billing_address_first_name"
                data-testid="input_billing_address_first_name"
                name="billing_address_first_name"
                type="text"
                label={t('addressForm.billing_address_first_name')}
                value={billing.first_name || billingAddress?.first_name || ''}
                onChange={(value) => updateBillingAddressData({ first_name: value })}
                error={errors.first_name as string}
              />
            </div>
          </Box>
          <ErrorDisplay message={errors.first_name} />
        </div>
        <div className="mb-8">
          <Box>
            <div className="relative h-10">
              <AddressField
                id="billing_address_last_name"
                data-testid="input_billing_address_last_name"
                name="billing_address_last_name"
                type="text"
                label={t('addressForm.billing_address_last_name')}
                value={billing.last_name || billingAddress?.last_name || ''}
                onChange={(value) => updateBillingAddressData({ last_name: value })}
                error={errors.last_name as string}
              />
            </div>
          </Box>
          <ErrorDisplay message={errors.last_name} />
        </div>
      </Grid>
      <div className="mb-8">
        <Box>
          <div className="relative h-10">
            <AddressField
              id="billing_address_line_1"
              data-testid="input_billing_address_line_1"
              name="billing_address_line_1"
              type="text"
              label={t('addressForm.billing_address_line_1')}
              value={billing.line_1 || billingAddress?.line_1 || ''}
              onChange={(value) => updateBillingAddressData({ line_1: value })}
              error={errors.line_1 as string}
            />
          </div>
        </Box>
        <ErrorDisplay message={errors.line_1} />
      </div>
      <div className="mb-8">
        <Box>
          <div className="relative h-10">
            <AddressField
              id="billing_address_line_2"
              data-testid="input_billing_address_line_2"
              name="billing_address_line_2"
              type="text"
              label={t('addressForm.billing_address_line_2')}
              value={billing.line_2 || billingAddress?.line_2 || ''}
              onChange={(value) => updateBillingAddressData({ line_2: value })}
              error={errors.line_2 as string}
            />
          </div>
        </Box>
        <ErrorDisplay message={errors.line_2} />
      </div>
      <Grid>
        <div className="mb-8">
          <Box>
            <div className="relative h-10">
              <AddressField
                id="billing_address_city"
                data-testid="input_billing_address_city"
                name="billing_address_city"
                type="text"
                label={t('addressForm.billing_address_city')}
                value={billing.city || billingAddress?.city || ''}
                onChange={(value) => updateBillingAddressData({ city: value })}
                error={errors.city as string}
              />
            </div>
          </Box>
          <ErrorDisplay message={errors.city} />
        </div>
        <div className="mb-8">
          <Box>
            <div className="relative h-10">
              <CountrySelect
                id="billing_address_country_code"
                data-testid="input_billing_address_country_code"
                name="billing_address_country_code"
                value={billing.country_code || billingAddress?.country_code || ''}
                onChange={handleCountryChange}
              />
            </div>
          </Box>
          <ErrorDisplay message={errors.country_code} />
        </div>
      </Grid>
      <Grid>
        <div className="mb-8">
          <Box>
            <div className="relative h-10">
              <StateSelect
                id="billing_address_state_code"
                data-testid="input_billing_address_state_code"
                name="billing_address_state_code"
                value={billing.state_code || billingAddress?.state_code || ''}
                onChange={handleStateChange}
                countryCode={billing.country_code || billingAddress?.country_code || ''}
              />
            </div>
          </Box>
          <ErrorDisplay message={errors.state_code} />
        </div>
        <div className="mb-8">
          <Box>
            <div className="relative h-10">
              <AddressField
                id="billing_address_zip_code"
                data-testid="input_billing_address_zip_code"
                name="billing_address_zip_code"
                type="text"
                label={t('addressForm.billing_address_zip_code')}
                value={billing.zip_code || billingAddress?.zip_code || ''}
                onChange={(value) => updateBillingAddressData({ zip_code: value })}
                error={errors.zip_code as string}
              />
            </div>
          </Box>
          <ErrorDisplay message={errors.zip_code} />
        </div>
      </Grid>
      <div className="mb-8">
        <Box>
          <div className="relative h-10">
            <AddressField
              id="billing_address_phone"
              data-testid="input_billing_address_phone"
              name="billing_address_phone"
              type="tel"
              label={t('addressForm.billing_address_phone')}
              value={billing.phone || billingAddress?.phone || ''}
              onChange={(value) => updateBillingAddressData({ phone: value })}
              error={errors.phone as string}
            />
          </div>
        </Box>
        <ErrorDisplay message={errors.phone} />
      </div>
      {requiresBillingInfo && (
        <div className="mb-8">
          <Box>
            <div className="relative h-10">
              <AddressField
                id="billing_address_billing_info"
                data-testid="input_billing_address_billing_info"
                name="billing_address_billing_info"
                type="text"
                label={t('addressForm.billing_address_billing_info')}
                value={billing.billing_info || billingAddress?.billing_info || ''}
                onChange={(value) => updateBillingAddressData({ billing_info: value })}
                error={errors.billing_info as string}
              />
            </div>
          </Box>
          <ErrorDisplay message={errors.billing_info} />
        </div>
      )}
    </>
  )
}
