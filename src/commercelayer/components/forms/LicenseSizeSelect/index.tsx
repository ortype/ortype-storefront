import { LicenseSize } from '@/commercelayer/providers/Order'
import {
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
} from '@/components/ui/chakra-select'
import { Size, sizes } from '@/lib/settings'
import { createListCollection } from '@chakra-ui/react'
import React, { useCallback, useEffect, useMemo, useState } from 'react'

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

  const handleSizeChange = useCallback(
    (e) => {
      const value = e.value
      if (!value) return
      const selectedSize = sizes.find((size) => size.value === value[0])
      setSelectedSize(selectedSize || null)
      setLicenseSize({ licenseSize: selectedSize })
    },
    [sizes, setSelectedSize]
  )

  const licenseSizeCollection = useMemo(
    () => createListCollection({ items: sizes }),
    [sizes]
  )

  // *************************************

  return (
    <SelectRoot
      variant={'subtle'}
      size={'sm'}
      fontSize={'md'}
      collection={licenseSizeCollection}
      value={[selectedSize?.value || '']}
      onValueChange={handleSizeChange}
    >
      <SelectTrigger>
        <SelectValueText placeholder="Select a size" />
      </SelectTrigger>
      <SelectContent portalled={false}>
        {sizes.map((option) => (
          <SelectItem key={option.value} item={option}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </SelectRoot>
  )
}
