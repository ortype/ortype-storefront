import { LicenseSize } from '@/commercelayer/providers/Order'
import {
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
} from '@/components/ui/chakra-select'
import { Size, sizes } from '@/lib/settings'
import { createListCollection, Fieldset } from '@chakra-ui/react'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { FieldsetLegend } from '@/commercelayer/components/ui/fieldset-legend'

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
    <Fieldset.Root>
      <FieldsetLegend>{'Company size of the license owner'}</FieldsetLegend>
      <Fieldset.Content asChild>
        <SelectRoot
          mt={1}
          variant={'subtle'}
          size={'lg'}
          fontSize={'md'}
          collection={licenseSizeCollection}
          value={[selectedSize?.value || '']}
          onValueChange={handleSizeChange}
          w={'100%'}
          positioning={{ sameWidth: true }}
          fontVariantNumeric={'tabular-nums'}
        >
          <SelectTrigger width={'100%'}>
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
      </Fieldset.Content>
    </Fieldset.Root>
  )
}
