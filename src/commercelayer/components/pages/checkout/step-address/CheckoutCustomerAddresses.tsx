import AddressesContainer from '@commercelayer/react-components/addresses/AddressesContainer'
import BillingAddressContainer from '@commercelayer/react-components/addresses/BillingAddressContainer'
import BillingAddressForm from '@commercelayer/react-components/addresses/BillingAddressForm'
import SaveAddressesButton from '@commercelayer/react-components/addresses/SaveAddressesButton'
import ShippingAddressContainer from '@commercelayer/react-components/addresses/ShippingAddressContainer'
import ShippingAddressForm from '@commercelayer/react-components/addresses/ShippingAddressForm'
import type { Address, Order } from '@commercelayer/sdk'
import { Transition } from '@headlessui/react'
import { Dispatch, Fragment, SetStateAction, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import {
  evaluateShippingToggle,
  ShippingToggleProps,
} from '@/commercelayer/components/pages/checkout/step-address'
import { CustomerAddressCard } from '@/components/ui/CustomerAddressCard'

import { Button } from '@/components/ui/chakra-button'
import { Checkbox } from '@/components/ui/checkbox'
import { Box, Grid, Heading } from '@chakra-ui/react'
import { AddressFormBottom } from './AddressFormBottom'
import { BillingAddressFormNew } from './BillingAddressFormNew'
import { ShippingAddressFormNew } from './ShippingAddressFormNew'

interface Props {
  billingAddress?: Address
  shippingAddress?: Address
  hasSameAddresses: boolean
  isShipmentRequired: boolean
  isUsingNewBillingAddress: boolean
  isUsingNewShippingAddress: boolean
  hasCustomerAddresses: boolean
  emailAddress?: string
  isLocalLoader: boolean
  shippingCountryCodeLock?: string
  shipToDifferentAddress: boolean
  setShipToDifferentAddress: Dispatch<SetStateAction<boolean>>
  openShippingAddress: (props: ShippingToggleProps) => void
  disabledShipToDifferentAddress: boolean
  handleSave: (params: { success: boolean; order?: Order }) => void
}

type AddressTypeEnum = 'shipping' | 'billing'

export const CheckoutCustomerAddresses: React.FC<Props> = ({
  billingAddress,
  shippingAddress,
  isUsingNewBillingAddress,
  isUsingNewShippingAddress,
  isShipmentRequired,
  hasSameAddresses,
  hasCustomerAddresses,
  emailAddress,
  isLocalLoader,
  shippingCountryCodeLock,
  shipToDifferentAddress,
  setShipToDifferentAddress,
  openShippingAddress,
  disabledShipToDifferentAddress,
  handleSave,
}: Props) => {
  const { t } = useTranslation()

  const [billingAddressFill, setBillingAddressFill] = useState(billingAddress)
  const [shippingAddressFill, setShippingAddressFill] =
    useState(shippingAddress)

  const [showBillingAddressForm, setShowBillingAddressForm] = useState<boolean>(
    isUsingNewBillingAddress
  )

  const [mountBillingAddressForm, setMountBillingAddressForm] = useState(
    isUsingNewBillingAddress
  )

  const [showShippingAddressForm, setShowShippingAddressForm] = useState(
    isUsingNewShippingAddress
  )

  const [mountShippingAddressForm, setMountShippingAddressForm] = useState(
    isUsingNewShippingAddress
  )

  useEffect(() => {
    if (shipToDifferentAddress && !hasCustomerAddresses) {
      // If billing and shipping are equivalent, show form but reset it
      if (hasSameAddresses) {
        setShippingAddressFill(undefined)
      }
      setShowShippingAddressForm(true)
      setMountShippingAddressForm(true)
    }
  }, [shipToDifferentAddress])

  useEffect(() => {
    // temp fix to resolve flag bug
    if (showBillingAddressForm) {
      localStorage.setItem(
        '_save_billing_address_to_customer_address_book',
        'false'
      )
    }
    if (showShippingAddressForm) {
      localStorage.setItem(
        '_save_shipping_address_to_customer_address_book',
        'false'
      )
    }
    // --
  }, [showBillingAddressForm, showShippingAddressForm])

  const handleScroll = (type: AddressTypeEnum) => {
    const tab = document
      .querySelector(`h3[data-testid="${type}-address"]`)
      ?.getBoundingClientRect()
    const top = window.scrollY + (tab?.top as number)
    const left = window.scrollX + (tab?.left as number)
    window.scrollTo({ left, top: top, behavior: 'smooth' })
  }

  const handleShowBillingForm = () => {
    setBillingAddressFill(undefined)
    setShowBillingAddressForm(!showBillingAddressForm)
    handleScroll('billing')
  }

  const handleShowShippingForm = () => {
    setShippingAddressFill(undefined)
    setShowShippingAddressForm(!showShippingAddressForm)
    handleScroll('shipping')
  }

  const handleToggle = () => {
    if (!hasCustomerAddresses) {
      handleShowShippingForm()
    }
    if (hasCustomerAddresses) {
      setMountShippingAddressForm(false)
      setShowShippingAddressForm(false)
    }
    setShipToDifferentAddress(!shipToDifferentAddress)
  }

  const onSelect = (address: Address) => {
    if (openShippingAddress) {
      openShippingAddress(
        evaluateShippingToggle({
          countryCode: address.country_code,
          shippingCountryCodeLock,
        })
      )
    }

    localStorage.setItem(
      '_save_billing_address_to_customer_address_book',
      'false'
    )
  }

  return (
    <>
      <AddressesContainer shipToDifferentAddress={shipToDifferentAddress}>
        <Heading size={'xs'} data-testid="billing-address">
          {t(`addressForm.billing_address_title`)}
        </Heading>
        <>
          {hasCustomerAddresses && (
            <>
              <Transition
                show={!showBillingAddressForm}
                {...addressesTransition}
              >
                <Grid className="mb-4">
                  <BillingAddressContainer>
                    <CustomerAddressCard
                      addressType="billing"
                      deselect={showBillingAddressForm}
                      onSelect={onSelect}
                    />
                  </BillingAddressContainer>
                </Grid>
              </Transition>

              {!showBillingAddressForm && hasCustomerAddresses && (
                <Button
                  dataTestId="add_new_billing_address"
                  action={handleShowBillingForm}
                />
              )}
            </>
          )}
        </>
        <Box>
          <Transition
            show={showBillingAddressForm}
            beforeEnter={() => setMountBillingAddressForm(true)}
            afterLeave={() => setMountBillingAddressForm(false)}
            {...formTransition}
          >
            <BillingAddressForm
              autoComplete="on"
              reset={!showBillingAddressForm}
              errorClassName="hasError"
            >
              {mountBillingAddressForm || !hasCustomerAddresses ? (
                <>
                  <BillingAddressFormNew
                    billingAddress={billingAddressFill}
                    openShippingAddress={openShippingAddress}
                  />
                  <AddressFormBottom
                    addressType="billing"
                    onClick={handleShowBillingForm}
                    hasCustomerAddresses={hasCustomerAddresses}
                  />
                </>
              ) : (
                <></>
              )}
            </BillingAddressForm>
          </Transition>
        </Box>
        {isShipmentRequired && (
          <>
            <Checkbox
              disabled={disabledShipToDifferentAddress}
              data-testid="button-ship-to-different-address"
              data-status={shipToDifferentAddress}
              label={t(`addressForm.ship_to_different_address`)}
              checked={shipToDifferentAddress}
              onChange={handleToggle}
            />
            <div className={`${shipToDifferentAddress ? '' : 'hidden'} mb-2`}>
              <Heading data-testid="shipping-address">
                {t(`addressForm.shipping_address_title`)}
              </Heading>
            </div>
            <div
              className={`${
                shipToDifferentAddress && hasCustomerAddresses
                  ? 'mb-4'
                  : 'hidden'
              }`}
            >
              <Transition
                show={!showShippingAddressForm}
                {...addressesTransition}
              >
                <Grid className="mb-4">
                  <ShippingAddressContainer>
                    <CustomerAddressCard
                      addressType="shipping"
                      deselect={showShippingAddressForm}
                      onSelect={() =>
                        localStorage.setItem(
                          '_save_shipping_address_to_customer_address_book',
                          'false'
                        )
                      }
                    />
                  </ShippingAddressContainer>
                </Grid>
              </Transition>

              {!showShippingAddressForm && (
                <Button
                  dataTestId="add_new_shipping_address"
                  action={handleShowShippingForm}
                />
              )}
            </div>
            <div className="mt-4">
              <Transition
                show={showShippingAddressForm}
                beforeEnter={() => setMountShippingAddressForm(true)}
                beforeLeave={() => setMountShippingAddressForm(false)}
                {...formTransition}
              >
                <ShippingAddressForm
                  autoComplete="on"
                  hidden={!shipToDifferentAddress}
                  reset={!mountShippingAddressForm}
                  errorClassName="hasError"
                  className="pt-2"
                >
                  {mountShippingAddressForm ? (
                    <>
                      <ShippingAddressFormNew
                        shippingAddress={shippingAddressFill}
                      />
                      <AddressFormBottom
                        className="mb-4"
                        addressType="shipping"
                        onClick={handleShowShippingForm}
                        hasCustomerAddresses={hasCustomerAddresses}
                      />
                    </>
                  ) : (
                    <></>
                  )}
                </ShippingAddressForm>
              </Transition>
            </div>
          </>
        )}
        <Button asChild variant={'subtle'}>
          <SaveAddressesButton
            disabled={isLocalLoader}
            label={
              <>
                {isShipmentRequired
                  ? t('stepCustomer.continueToDelivery')
                  : t('stepAddress.continueToLicense')}
              </>
            }
            data-testid="save-customer-button"
            onClick={handleSave}
          />
        </Button>
      </AddressesContainer>
    </>
  )
}

const addressesTransition = {
  enter: 'transition duration-400 ease-in',
  enterFrom: 'opacity-0  -translate-y-full',
  enterTo: 'opacity-100 translate-y-0',
  leave: 'duration-200 transition ease-out absolute top-0 w-full',
  leaveFrom: 'opacity-100 translate-y-0 ',
  leaveTo: 'opacity-0 -translate-y-full',
}

const formTransition = {
  enter: 'transition duration-400 ease-in',
  enterFrom: 'opacity-0 translate-y-full',
  enterTo: 'opacity-100 translate-y-0',
  leave: 'duration-400 transition ease-out absolute top-0 w-full',
  leaveFrom: 'opacity-100 translate-y-0',
  leaveTo: 'opacity-0 translate-y-full',
}
