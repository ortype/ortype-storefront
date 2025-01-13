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

const LicenseOwnerInput = () => {
  const [isLocalLoader, setIsLocalLoader] = useState(false)
  const { handleSubmit, submitValidation, validation, values, errors } =
    useRapidForm()
  const { order, orderId, licenseOwner, setLicenseOwner, updateOrder } =
    useOrderContext()

  const s = async (values, err, e) => {
    setIsLocalLoader(true)
    console.log('LicenseOwnerInput: ', order, licenseOwner)
    const owner = { is_client: false, full_name: values['full_name'].value }
    try {
      // @TODO: updateOrder returns an order object without `line_items`
      // consider using the CartProvider reducer with utils to update the order directly
      // we pass the `owner` and `orderId` and call the API and re-fetch the order
      // @NOTE: we are now using a custom updateOrder that should return line_items...
      // what else do we need for this usecase here... maybe we are good?
      const { order: updatedOrder } = await updateOrder({
        id: orderId,
        attributes: {
          metadata: {
            license: {
              ...order?.metadata?.license,
              owner,
            },
          },
        },
        // @TODO: there is an `include` param, maybe this can pass the `line_items` back
      })
      console.log('updatedOrder: ', updatedOrder)

      setLicenseOwner({
        order: updatedOrder,
        licenseOwner: updatedOrder?.metadata?.license?.owner,
      })
    } catch (e) {
      console.log('License updateOrder error: ', e)
    }
    setIsLocalLoader(false)
  }

  return (
    <form
      as={Box}
      ref={submitValidation}
      autoComplete="off"
      onSubmit={handleSubmit(s)}
    >
      <FormControl>
        <FormLabel>{'License Owner/Company*'}</FormLabel>
        <Input
          name={'full_name'}
          type={'text'}
          ref={validation}
          size={'lg'}
          defaultValue={order?.metadata?.license?.owner?.full_name}
        />
      </FormControl>
      <Button type={'submit'}>Save</Button>
    </form>
  )
}

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
  const { orderId, order, itemsCount, licenseOwner, setLicenseOwner } =
    useOrderContext()

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
