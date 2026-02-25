import { useAddressesContext } from '@/commercelayer/providers/addresses'
import { useState, type JSX, type ReactNode } from 'react'

import { useCustomerContext } from '@/commercelayer/providers/customer'
import type { TCustomerAddress } from '@/commercelayer/providers/customer/reducer'

import { formCleaner } from '@/commercelayer/utils/formCleaner'
import { Button } from '@chakra-ui/react'
import isFunction from 'lodash/isFunction'

const REQUIRED_ADDRESS_FIELDS = [
  'first_name',
  'last_name',
  'line_1',
  'city',
  'country_code',
  'zip_code',
  'phone',
] as const

interface TOnClick {
  success: boolean
}

interface Props
  extends Omit<JSX.IntrinsicElements['button'], 'children' | 'onClick'> {
  label?: string | ReactNode
  onClick?: (params: TOnClick) => void
  addressId?: string
}

export function SaveAddressesButton(props: Props): JSX.Element {
  const { label = 'Save', disabled = false, addressId, onClick, ...p } = props
  const { errors, billing_address: billingAddress } = useAddressesContext()
  const { createCustomerAddress } = useCustomerContext()
  const [forceDisable, setForceDisable] = useState(false)

  // Disable when required billing address fields are missing
  const hasRequiredFields = REQUIRED_ADDRESS_FIELDS.every(
    (field) =>
      billingAddress?.[field] && String(billingAddress[field]).trim() !== ''
  )
  const hasErrors = errors && errors.length > 0
  const disable = disabled || !hasRequiredFields || !!hasErrors

  const handleClick = async (): Promise<void> => {
    if (disable || !createCustomerAddress) return

    setForceDisable(true)
    try {
      const address = { ...formCleaner(billingAddress) }
      if (addressId) address.id = addressId
      await createCustomerAddress(address as TCustomerAddress)
      onClick?.({ success: true })
    } catch {
      onClick?.({ success: false })
    } finally {
      setForceDisable(false)
    }
  }

  return (
    <Button
      type="button"
      variant={'outline'}
      bg={'colorPalette.fg'}
      color={'colorPalette.bg'}
      borderRadius={'5rem'}
      size={'sm'}
      fontSize={'md'}
      disabled={disable || forceDisable}
      onClick={() => {
        handleClick()
      }}
      {...p}
    >
      {isFunction(label) ? label() : label}
    </Button>
  )
}

export default SaveAddressesButton
