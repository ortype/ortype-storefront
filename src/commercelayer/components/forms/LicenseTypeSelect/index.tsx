import {
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
} from '@/components/ui/chakra-select'
import { Type } from '@/lib/settings'
import { createListCollection } from '@chakra-ui/react'
import { SkuOption } from '@commercelayer/sdk'
import React, { useCallback, useMemo, useState } from 'react'

interface Props {
  skuOptions: SkuOption[]
  selectedSkuOptions: SkuOption[]
  font: any
  setSelectedSkuOptions: (params: {
    font: any // @TODO: font type
    selectedSkuOptions: SkuOption[]
  }) => void
}

export const LicenseTypeSelect: React.FC<Props> = ({
  font,
  skuOptions,
  selectedSkuOptions,
  setSelectedSkuOptions,
}) => {
  const typeOptions = skuOptions
    .sort(
      (a, b) =>
        parseInt(a.reference.charAt(0)) - parseInt(b.reference.charAt(0))
    )
    ?.map(
      ({ reference: value, name: label, price_amount_cents: basePrice }) => ({
        value,
        label,
        basePrice,
      })
    )

  const savedSelection = selectedSkuOptions
    .sort(
      (a, b) =>
        parseInt(a.reference.charAt(0)) - parseInt(b.reference.charAt(0))
    )
    ?.map(
      ({ reference: value, name: label, price_amount_cents: basePrice }) => ({
        value,
        label,
        basePrice,
      })
    )

  const [selectedTypes, setSelectedTypes] = useState<Type[]>(savedSelection)

  const handleTypeChange = useCallback(
    (e: { value: string[] }) => {
      const values = e.value
      console.log('selectedValues: ', values)
      // Find the corresponding options for the selected values
      const selectedOptions = values
        .map((value) => typeOptions.find((option) => option.value === value))
        .filter(Boolean) as Type[]

      // @TODO: review this logic
      // this is only interesting if we want to select skuOptions
      const selectedSkuOptionsList = values
        .map((value) => skuOptions.find((type) => type.reference === value))
        .filter(Boolean) as SkuOption[]

      setSelectedTypes(selectedOptions) // update Select component state

      setSelectedSkuOptions({
        selectedSkuOptions: selectedSkuOptionsList,
        font,
      })
      // @TODO: on changing selected SKU options, update all line_items on the order
    },
    [typeOptions, skuOptions, setSelectedSkuOptions, font]
  )

  const licenseTypeCollection = useMemo(
    () => createListCollection({ items: typeOptions }),
    [typeOptions]
  )

  return (
    <>
      <SelectRoot
        variant={'subtle'}
        size={'sm'}
        fontSize={'md'}
        collection={licenseTypeCollection}
        value={selectedTypes.map((type) => type.value)}
        onValueChange={handleTypeChange}
        multiple
      >
        <SelectTrigger>
          <SelectValueText placeholder="Select a type" />
        </SelectTrigger>
        <SelectContent portalled={false}>
          {typeOptions.map((option) => (
            <SelectItem key={option.value} item={option}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </SelectRoot>
    </>
  )
}
