import { LicenseSize } from '@/commercelayer/providers/Order'
import { FloatingLabelSelect } from '@/commercelayer/components/ui/floating-label-select'
import { Size, sizes } from '@/lib/settings'
import React, { useCallback, useEffect, useState } from 'react'

interface Props {
  licenseSize: Size
  setLicenseSize: (params: { licenseSize?: LicenseSize }) => void
  label?: string
}

export const LicenseSizeNativeSelect: React.FC<Props> = ({
  licenseSize,
  setLicenseSize,
  label = 'Company size of the license owner',
}) => {
  const [selectedSize, setSelectedSize] = useState<string>(
    licenseSize?.value || ''
  )

  // Keep component synced with data from Provider
  useEffect(() => {
    setSelectedSize(licenseSize?.value || '')
  }, [licenseSize])

  const handleSizeChange = useCallback(
    (value: string) => {
      const selectedSize = sizes.find((size) => size.value === value)
      setSelectedSize(value)
      setLicenseSize({ licenseSize: selectedSize })
    },
    [setLicenseSize]
  )

  // Convert sizes to items format for FloatingLabelSelect
  const sizeItems = sizes.map((size) => ({
    value: size.value,
    label: size.label,
    disabled: false,
  }))

  return (
    <FloatingLabelSelect
      label={label}
      items={sizeItems}
      value={selectedSize}
      onValueChange={handleSizeChange}
      variant="subtle"
      size="lg"
      fontSize="md"
    />
  )
}
