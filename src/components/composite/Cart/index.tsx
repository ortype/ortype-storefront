import { Account } from '@/commercelayer/components/composite/Account'
import LicenseOwnerInput from '@/commercelayer/components/forms/LicenseOwnerInput'
import { useOrderContext } from '@/commercelayer/providers/Order'
import { Field } from '@/components/ui/field'
import { Box, Button, Fieldset, Link, Heading } from '@chakra-ui/react'
import NextLink from 'next/link'

import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

import { LicenseSizeSelect } from '@/commercelayer/components/forms/LicenseSizeSelect'
import { CartItem } from '@/components/composite/Cart/CartItem'
import { IconButton } from '@/components/ui/chakra-iconbutton'
import {
  LineItem,
  LineItemsContainer,
  useOrderContainer,
} from '@commercelayer/react-components'
import type { Order } from '@commercelayer/sdk'
import { useRapidForm } from 'rapid-form'
import { useContext, useRef, useState } from 'react'

const CheckoutButton = ({ isDisabled, order }) => {
  return (
    <Button as={Link} disabled={isDisabled} href={`/checkout/${order?.id}`}>
      {'Checkout'}
    </Button>
  )
}

const Cart = ({ openMenu, setMenuOpen, openCart, setCartOpen }) => {
  const { orderId, order, itemsCount, licenseSize, setLicenseSize } =
    useOrderContext()

  // @TODO: CartProvider with next/dynamic to load the cart and data only if we have an orderid
  if (!orderId || !order) {
    return <div>{'No items in your cart'}</div>
  }

  return (
    <>
      <IconButton
        size={'md'}
        variant={'circle'}
        onMouseEnter={() => setMenuOpen(true)}
        // onMouseLeave={handleCloseMenu}
        data-active={openMenu ? 'true' : undefined}
        transition={'none'}
        bg={'white'}
        _hover={{
          bg: 'black',
          color: 'white',
        }}
      >{`${itemsCount}`}</IconButton>
      <DialogRoot
        open={openCart}
        onOpenChange={(e) => setCartOpen(e.open)}
        size={'full'}
        // placement="center"
        motionPreset="slide-in-bottom"
        scrollBehavior="inside"
        // modal
      >
        {/*<DialogBackdrop />*/}
        <DialogContent bg={'white'}>
          <DialogHeader>
            <Heading
              textAlign={'center'}
              size={'2xl'}
              fontWeight={'normal'}
              textTransform={'uppercase'}
              mx={'auto'}
            >
              Cart or Bag Or Basket
            </Heading>
          </DialogHeader>
          <DialogCloseTrigger insetStart={2} insetEnd={'auto'} />
          <DialogBody>
            <LicenseOwnerInput />
            <Fieldset.Root>
              <Field label={'Company size of the license owner'}>
                {licenseSize && (
                  <LicenseSizeSelect
                    setLicenseSize={setLicenseSize}
                    licenseSize={licenseSize}
                  />
                )}
              </Field>
            </Fieldset.Root>
            {
              // @TODO: this check for order being defined shouldn't be needed
              order.line_items &&
                order.line_items.map((lineItem) => (
                  <CartItem key={lineItem.id} lineItem={lineItem} />
                ))
            }
          </DialogBody>
          <DialogFooter>
            <CheckoutButton order={order} isDisabled={false} />
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </>
  )
}

export default Cart
