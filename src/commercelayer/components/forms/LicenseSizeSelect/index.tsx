import { FieldsetLegend } from '@/commercelayer/components/ui/fieldset-legend'
import { LicenseSize, useOrderContext } from '@/commercelayer/providers/Order'
import {
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
} from '@/components/ui/chakra-select'
import { type CompanySize } from '@/sanity/lib/queries'
import { createListCollection, Fieldset } from '@chakra-ui/react'
import React, { useCallback, useEffect, useMemo, useState } from 'react'

interface Props {
  label?: string
  info?: string
  licenseSize: CompanySize
  setLicenseSize: (params: { licenseSize?: LicenseSize }) => void
}

export const LicenseSizeSelect: React.FC<Props> = ({
  label,
  info,
  licenseSize,
  setLicenseSize,
}) => {
  // *************************************
  // License size select logic

  const { companySizes: sizes } = useOrderContext()

  const [selectedSize, setSelectedSize] = useState<CompanySize | null>(
    licenseSize
  )

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
      <FieldsetLegend info={info}>
        {label || 'Company size of the license owner'}
      </FieldsetLegend>
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
              <SelectItem
                key={option.value}
                item={option}
                _checked={{
                  bg: 'blackAlpha.300',
                }}
                _hover={{
                  cursor: 'pointer',
                  bg: 'blackAlpha.300',
                }}
                transition={'background 300ms ease-in-out'}
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </SelectRoot>
      </Fieldset.Content>
    </Fieldset.Root>
  )
}
