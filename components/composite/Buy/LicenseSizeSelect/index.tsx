import { CommerceLayerClient, LineItemUpdate } from '@commercelayer/sdk'
import { SelectLicenseSize } from 'components/composite/StepLicense/SelectLicenseSize'
import { Size, sizes } from 'lib/settings'
import React, { Dispatch, useEffect, useState } from 'react'
import Select from 'react-select'
import { createOrUpdateOrder } from 'components/data/BuyProvider/utils'

interface Props {
  cl: CommerceLayerClient
  licenseSize: Size
  // selectLicenseSize: Dispatch // @TODO: how to type a dispatch function
}

export const LicenseSizeSelect: React.FC<Props> = ({
  cl,
  licenseSize,
  setLicenseSize,
}) => {
  // *************************************
  // License size select logic
  const [selectedSize, setSelectedSize] = useState<Size | null>(licenseSize)

  useEffect(() => {
    setSelectedSize(licenseSize) // keep component synced with data from Provider
  }, [licenseSize])

  const handleSizeChange = async (selectedOption: object) => {
    const selectedSize = sizes.find(
      (size) => size.value === selectedOption.value
    )
    setSelectedSize(selectedSize || null)
    setLicenseSize({ licenseSize: selectedSize })
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
