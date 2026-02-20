import type {
  OrderUpdate,
  Order,
  CommerceLayerClient,
  LineItem,
  Address,
  AddressCreate,
} from '@commercelayer/sdk'

interface InvertedAddressesHandlerParams {
  billingAddress?: AddressCreate
  billingAddressId?: string
  customerEmail?: string
  order: Order
  shipToDifferentAddress?: boolean
  shippingAddress?: AddressCreate
  shippingAddressId?: string
  sdk: CommerceLayerClient
}

export async function invertedAddressesHandler({
  order,
  billingAddress,
  billingAddressId,
  customerEmail,
  shipToDifferentAddress,
  shippingAddress,
  shippingAddressId,
  sdk,
}: InvertedAddressesHandlerParams): Promise<OrderUpdate | null> {
  const currentShippingAddressRef = order?.shipping_address?.reference
  const orderAttributes: OrderUpdate = {
    id: order?.id,
    _billing_address_clone_id: shippingAddressId,
    _shipping_address_clone_id: shippingAddressId,
    customer_email: customerEmail,
  }
  if (currentShippingAddressRef === shippingAddressId) {
    orderAttributes._billing_address_clone_id = order?.billing_address?.id
    orderAttributes._shipping_address_clone_id = order?.shipping_address?.id
  }
  if (
    shippingAddress != null &&
    Object.keys(shippingAddress).length > 0 &&
    !shippingAddressId
  ) {
    delete orderAttributes._billing_address_clone_id
    delete orderAttributes._shipping_address_clone_id
    orderAttributes._billing_address_same_as_shipping = true
    const hasMetadata = Object.keys(shippingAddress).filter((key) => {
      if (key.startsWith('metadata_')) {
        return true
      }
      return false
    })
    if (hasMetadata?.length > 0) {
      hasMetadata.forEach((key) => {
        const metadataKey = key.replace('metadata_', '')
        shippingAddress.metadata = {
          ...(shippingAddress.metadata || {}),
          // @ts-expect-error type mismatch
          [metadataKey]: shippingAddress[key],
        }
        // @ts-expect-error type mismatch
        delete shippingAddress[key]
      })
    }
    const address = await sdk.addresses.create(shippingAddress)
    orderAttributes.shipping_address = sdk.addresses.relationship(address.id)
  }
  if (shipToDifferentAddress) {
    delete orderAttributes._billing_address_same_as_shipping
    if (billingAddressId)
      orderAttributes._billing_address_clone_id = billingAddressId
    if (billingAddress != null && Object.keys(billingAddress).length > 0) {
      delete orderAttributes._billing_address_clone_id
      const hasMetadata = Object.keys(billingAddress).filter((key) => {
        if (key.startsWith('metadata_')) {
          return true
        }
        return false
      })
      if (hasMetadata?.length > 0) {
        hasMetadata.forEach((key) => {
          const metadataKey = key.replace('metadata_', '')
          billingAddress.metadata = {
            ...(billingAddress.metadata || {}),
            // @ts-expect-error type mismatch
            [metadataKey]: billingAddress[key],
          }
          // @ts-expect-error type mismatch
          delete billingAddress[key]
        })
      }
      const address = await sdk.addresses.create(billingAddress)
      orderAttributes.billing_address = sdk.addresses.relationship(address.id)
    }
  }
  return orderAttributes
}

export function sanitizeMetadataFields(address: AddressCreate): AddressCreate {
  const hasMetadata = Object.keys(address).filter((key) => {
    if (key.startsWith('metadata_')) {
      return true
    }
    return false
  })
  if (hasMetadata?.length > 0) {
    hasMetadata.forEach((key) => {
      const metadataKey = key.replace('metadata_', '')
      address.metadata = {
        ...(address.metadata || {}),
        [metadataKey]: address[key as keyof AddressCreate],
      }
      delete address[key as keyof AddressCreate]
    })
  }
  return address
}
