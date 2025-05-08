import { Type } from '@/lib/settings'
import { Checkbox, CheckboxGroup, Fieldset, Stack } from '@chakra-ui/react'
import { SkuOption } from '@commercelayer/sdk'
import React, { useCallback, useEffect, useState } from 'react'

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
      <CheckboxGroup
        // defaultValue={['1-licenseType-desktop']}
        value={selectedTypes?.map((option) => option.value) || ['']}
        onValueChange={(e) => handleTypeChange(e)}
      >
        <Fieldset.Legend fontSize="sm" mt={4}>
          {'A license for?'}
        </Fieldset.Legend>
        <Fieldset.Content asChild>
          <Stack gap={2} direction="column" align="stretch" bg={'#eee'} p={2}>
            {typeOptions.map((option) => (
              <Checkbox.Root key={option.value} value={option.value}>
                <Checkbox.HiddenInput />
                <Checkbox.Control />
                <Checkbox.Label>{option.label}</Checkbox.Label>
              </Checkbox.Root>
            ))}
          </Stack>
        </Fieldset.Content>
      </CheckboxGroup>
    </Fieldset.Root>
  )
}
