import { LicenseSize } from '@/commercelayer/providers/Order'
import { Size, sizes } from '@/lib/settings'
import React, { useEffect, useState } from 'react'
import Select from 'react-select'

interface Props {
  licenseSize: Size
  setLicenseSize: (params: { licenseSize?: LicenseSize }) => void
}

export const LicenseSizeSelect: React.FC<Props> = ({
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
