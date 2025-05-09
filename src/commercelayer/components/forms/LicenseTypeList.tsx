import { Type } from '@/lib/settings'
import { Checkbox, CheckboxGroup, Fieldset, Stack } from '@chakra-ui/react'
import { SkuOption } from '@commercelayer/sdk'
import React, { useCallback, useEffect, useState } from 'react'
import { FieldsetLegend } from '@/components/composite/Buy'

interface Props {
  skuOptions: SkuOption[]
  selectedSkuOptions: SkuOption[]
  font: any
  setSelectedSkuOptions: (params: {
    font: any // @TODO: font type
    selectedSkuOptions: SkuOption[]
  }) => void
}

const mapSkuOptionsToTypes = (options: SkuOption[]): Type[] => {
  return options
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
}

export const LicenseTypeList: React.FC<Props> = ({
  font,
  skuOptions,
  selectedSkuOptions,
  setSelectedSkuOptions,
}) => {
  const typeOptions = mapSkuOptionsToTypes(skuOptions)
  const [selectedTypes, setSelectedTypes] = useState<Type[]>(
    mapSkuOptionsToTypes(selectedSkuOptions)
  )

  // Keep selectedTypes in sync with prop changes
  useEffect(() => {
    setSelectedTypes(mapSkuOptionsToTypes(selectedSkuOptions))
  }, [selectedSkuOptions])

  const handleTypeChange = useCallback(
    (values: string[]) => {
      const selectedTypeOptions = values.map((value) =>
        typeOptions.find((option) => option.value === value)
      )

      console.log({ values, selectedTypeOptions, typeOptions })

      if (selectedTypeOptions.length === 0) {
        return false
      }

      setSelectedTypes(selectedTypeOptions)

      const selectedSkuOptionsList = values
        .map((value) => skuOptions.find((sku) => sku.reference === value))
        .filter(Boolean) as SkuOption[]

      setSelectedSkuOptions({
        selectedSkuOptions: selectedSkuOptionsList,
        font,
      })
    },
    [typeOptions, skuOptions, selectedTypes, setSelectedSkuOptions, font]
  )

  return (
    <Fieldset.Root>
      <FieldsetLegend>{'A license for?'}</FieldsetLegend>
      <Fieldset.Content asChild>
        <CheckboxGroup
          value={selectedTypes?.map((option) => option.value) || ['']}
          onValueChange={(e) => handleTypeChange(e)}
          bg={'#eee'}
          mt={1}
          gap={2}
          p={2}
        >
          {typeOptions.map((option) => (
            <Checkbox.Root
              key={option.value}
              value={option.value}
              variant={'outline'}
              size={'lg'}
            >
              <Checkbox.HiddenInput />
              <Checkbox.Control />
              <Checkbox.Label fontSize={'lg'}>{option.label}</Checkbox.Label>
            </Checkbox.Root>
          ))}
        </CheckboxGroup>
      </Fieldset.Content>
    </Fieldset.Root>
  )
}
