import LicenseOwnerInput from '@/commercelayer/components/forms/LicenseOwnerInput'
import { useOrderContext } from '@/commercelayer/providers/Order'
import { Field } from '@/components/ui/field'
import { Button, Fieldset, Link } from '@chakra-ui/react'

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

import {
  LineItem,
  LineItemsContainer,
  useOrderContainer,
} from '@commercelayer/react-components'
import type { Order } from '@commercelayer/sdk'
import { CartItem } from 'components/composite/Cart/CartItem'
import { SelectLicenseSize } from 'components/composite/StepLicense/SelectLicenseSize'
import { CartContext } from 'components/data/CartProvider'
import { useRapidForm } from 'rapid-form'
import { useContext, useState } from 'react'

const CheckoutButton = ({ isDisabled, order }) => {
  return (
    <Button as={Link} disabled={isDisabled} href={`/checkout/${order?.id}`}>
      {'Checkout'}
    </Button>
  )
}

const Cart = () => {
  const cartCtx = useContext(CartContext)
  const { orderId, order, itemsCount } = useOrderContext()

  // @TODO: CartProvider with next/dynamic to load the cart and data only if we have an orderid
  if (!orderId || !order) {
    return <div>{'No items in your cart'}</div>
  }

  return (
    <>
      <DialogRoot
        size={'cover'}
        placement="center"
        motionPreset="slide-in-bottom"
        modal
      >
        {/*<DialogBackdrop />*/}
        <DialogTrigger asChild>
          <Button size={'xs'}>{`Cart (${itemsCount})`}</Button>
        </DialogTrigger>
        <DialogContent bg={'white'}>
          <DialogHeader>Cart or Bag Or Basket</DialogHeader>
          <DialogCloseTrigger />
          <DialogBody>
            <LicenseOwnerInput />
            <Fieldset.Root>
              <Field label={'Company size of the license owner'}>
                <SelectLicenseSize />
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
