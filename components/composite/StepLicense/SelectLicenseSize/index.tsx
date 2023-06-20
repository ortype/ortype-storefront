import { Box } from '@chakra-ui/react'
import { useOrderContainer } from '@commercelayer/react-components'
import CommerceLayer, { LineItemUpdate } from '@commercelayer/sdk'
import { CheckoutContext } from 'components/data/CheckoutProvider'
import { Size, sizes, Type, types } from 'lib/settings'
import React, { useContext, useEffect, useState } from 'react'
import Select from 'react-select'

interface Props {
  types: Type[]
  sizes: Size[]
}

interface SelectLicenseSizeProps {}

export const SelectLicenseSize: React.FC<SelectLicenseSizeProps> = ({}) => {
  // *************************************
  // License size select logic
  // @TODO: consider storing the size object in metadata instead of just the value
  const [selectedSize, setSelectedSize] = useState<Size | null>(sizes[0])
  const { updateOrder } = useOrderContainer()
  const checkoutCtx = useContext(CheckoutContext)

  const { orderId, order, setLicenseSize } = checkoutCtx

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
