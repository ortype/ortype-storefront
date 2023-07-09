import { Box } from '@chakra-ui/react'
import { useOrderContainer } from '@commercelayer/react-components'
import CommerceLayer, { LineItemUpdate } from '@commercelayer/sdk'
import { Size, sizes, Type, types } from 'lib/settings'
import React, { useContext, useEffect, useState } from 'react'
import Select from 'react-select'
import { type CartProviderData } from 'components/data/CartProvider'
import { type CheckoutProviderData } from 'components/data/CheckoutProvider'

interface Props {
  types: Type[]
  sizes: Size[]
}

interface SelectLicenseSizeProps {
  ctx: CartProviderData | CheckoutProviderData
  // @TODO: add type
}

export const SelectLicenseSize: React.FC<SelectLicenseSizeProps> = ({
  ctx,
}) => {
  // *************************************
  // License size select logic
  // @TODO: consider storing the size object in metadata instead of just the value
  const [selectedSize, setSelectedSize] = useState<Size | null>(sizes[0])
  const { updateOrder } = useOrderContainer()

  const { orderId, order, setLicenseSize } = ctx

  useEffect(() => {
    if (order?.metadata) {
      const initialSize = sizes.find(
        ({ value }) => value === order.metadata.license?.size?.value
      )
      setSelectedSize(initialSize)
    }
  }, [order?.updatedAt])

  const handleSizeChange = async (selectedOption: object) => {
    const selectedSize = sizes.find(
      (size) => size.value === selectedOption.value
    )
    setSelectedSize(selectedSize || null)

    try {
      const { order: updatedOrder } = await updateOrder({
        id: orderId,
        attributes: {
          metadata: {
            license: {
              ...order.metadata?.license,
              size: selectedSize,
            },
          },
        },
      })

      setLicenseSize({
        order: updatedOrder,
        licenseSize: updatedOrder?.metadata?.license?.size,
      })
    } catch (e) {
      console.log('License updateOrder error: ', e)
    }
  }

  const sizeOptions = sizes.map((size) => ({
    value: size.value,
    label: size.label,
  }))

  // *************************************

  return (
    <Select
      placeholder={'Select a size'}
      options={sizeOptions}
      value={selectedSize}
      onChange={handleSizeChange}
    />
  )
}
