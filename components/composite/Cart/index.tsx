import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
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
import { useCart } from 'components/data/CartProvider'
import { useRapidForm } from 'rapid-form'
import { useState } from 'react'

export const Cart = () => {
  const [isLocalLoader, setIsLocalLoader] = useState(false)
  const { handleSubmit, submitValidation, validation, values, errors } =
    useRapidForm()
  const { updateOrder } = useOrderContainer()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { settings } = useCart()
  const {
    isValid,
    orderId,
    order,
    isGuest,
    licenseOwner,
    billingAddress,
    setLicenseOwner,
  } = settings
  console.log('cart settings: ', settings)

  const s = async (values, err, e) => {
    setIsLocalLoader(true)
    const owner = { is_client: false, full_name: values['full_name'].value }
    try {
      const { order: updatedOrder } = await updateOrder({
        id: orderId,
        attributes: {
          metadata: {
            license: {
              ...order.metadata?.license,
              owner,
            },
          },
        },
        // there is an `include` param
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

  // @TODO: CartProvider with next/dynamic to load the cart and data only if we have an orderid
  if (!orderId || !isValid) {
    return <div>{'No items in your cart'}</div>
  }

  return (
    <>
      <Button onClick={onOpen}>{`Cart (${settings.itemsCount})`}</Button>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Cart or Bag Or Basket</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
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
            <FormControl>
              <FormLabel>{'Company size of the license owner'}</FormLabel>
              {/*<SelectLicenseSize />*/}
            </FormControl>
            {order.line_items &&
              order.line_items.map((lineItem) => (
                <CartItem key={lineItem.id} lineItem={lineItem} />
              ))}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
