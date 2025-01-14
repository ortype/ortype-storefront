import LicenseOwnerInput from '@/commercelayer/components/forms/LicenseOwnerInput'
import { useOrderContext } from '@/commercelayer/providers/Order'
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Link,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  useDisclosure,
} from '@chakra-ui/react'
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
  const { isOpen, onOpen, onClose } = useDisclosure()
  const cartCtx = useContext(CartContext)
  const { orderId, order, itemsCount } = useOrderContext()

  // @TODO: CartProvider with next/dynamic to load the cart and data only if we have an orderid
  if (!orderId || !order) {
    return <div>{'No items in your cart'}</div>
  }

  return (
    <>
      <Button onClick={onOpen} size={'xs'}>{`Cart (${itemsCount})`}</Button>
      <Modal isOpen={isOpen} onClose={onClose} size={'full'}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Cart or Bag Or Basket</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <LicenseOwnerInput />
            <FormControl>
              <FormLabel>{'Company size of the license owner'}</FormLabel>
              <SelectLicenseSize />
            </FormControl>
            {
              // @TODO: this check for order being defined shouldn't be needed
              order.line_items &&
                order.line_items.map((lineItem) => (
                  <CartItem key={lineItem.id} lineItem={lineItem} />
                ))
            }
          </ModalBody>
          <ModalFooter>
            <CheckoutButton order={order} isDisabled={false} />
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default Cart
