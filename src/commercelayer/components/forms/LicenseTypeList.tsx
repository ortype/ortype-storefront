import { FieldsetLegend } from '@/commercelayer/components/ui/fieldset-legend'
import { Type } from '@/lib/settings'
import {
  Box,
  Checkbox,
  CheckboxGroup,
  Fieldset,
  Stack,
  Text,
} from '@chakra-ui/react'
import { SkuOption } from '@commercelayer/sdk'
import React, { useCallback, useEffect, useState } from 'react'
import CustomLicenseType from '../pages/buy/custom-license-type'

interface Props {
  label?: string
  info?: string
  skuOptions: SkuOption[]
  selectedSkuOptions: SkuOption[]
  font: any
  setSelectedSkuOptions: (params: {
    font: any // @TODO: font type
    selectedSkuOptions: SkuOption[]
  }) => void
}

const mapSkuOptionsToTypes = (options: SkuOption[]): Type[] => {
  return options?.map(
    ({ reference: value, name: label, price_amount_cents: basePrice }) => ({
      value,
      label,
      basePrice,
    })
  )
}

export const LicenseTypeList: React.FC<Props> = ({
  label,
  info,
  font,
  skuOptions,
  selectedSkuOptions,
  setSelectedSkuOptions,
}) => {
  const typeOptions = mapSkuOptionsToTypes(skuOptions)
  const [selectedTypes, setSelectedTypes] = useState<Type[]>(
    mapSkuOptionsToTypes(selectedSkuOptions)
  )

  const [open, setOpen] = useState(false)

  // Keep selectedTypes in sync with prop changes
  useEffect(() => {
    const mappedTypes = mapSkuOptionsToTypes(selectedSkuOptions)

    if (process.env.NODE_ENV !== 'production') {
      console.log('🎯 LicenseTypeList: Syncing selected types:', {
        selectedSkuOptions: selectedSkuOptions.map((opt) => ({
          id: opt.id,
          name: opt.name,
          reference: opt.reference,
        })),
        mappedTypes,
        currentSelectedTypes: selectedTypes,
      })
    }

    setSelectedTypes(mappedTypes)
  }, [selectedSkuOptions])

  const handleTypeChange = useCallback(
    (values: string[]) => {
      // If no values selected, update state with empty arrays
      if (values.length === 0) {
        setSelectedTypes([])
        setSelectedSkuOptions({
          selectedSkuOptions: [],
          font,
        })
        return
      }

      const selectedTypeOptions = values.map((value) =>
        typeOptions.find((option) => option.value === value)
      )

      if (process.env.NODE_ENV !== 'production') {
        console.log({ values, selectedTypeOptions, typeOptions })
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
    <>
      <Fieldset.Root>
        <FieldsetLegend info={info}>
          {label || '2. A license for?'}
        </FieldsetLegend>
        <Fieldset.Content asChild>
          <CheckboxGroup
            value={selectedTypes?.map((option) => option.value) || []}
            onValueChange={(e) => handleTypeChange(e)}
            mt={1}
            gap={'3px'}
          >
            {typeOptions.map((option) => (
              <Checkbox.Root
                key={option.value}
                value={option.value}
                variant={'outline'}
                size={'md'}
                py={2}
                px={4}
                w={'full'}
              >
                <Checkbox.HiddenInput />
                <Checkbox.Control />
                <Checkbox.Label
                  fontSize={{ base: 'lg', xl: 'sm', '2xl': 'md', '3xl': 'lg' }}
                >
                  {option.label}
                </Checkbox.Label>
              </Checkbox.Root>
            ))}
          </CheckboxGroup>
        </Fieldset.Content>
      </Fieldset.Root>
      <Text
        as={Box}
        py={2}
        textAlign={'center'}
        textStyle={'xs'}
        opacity={0.8}
        px={4}
        onClick={() => setOpen(true)}
        cursor={'pointer'}
      >
        {`Need something else?`}
        {` Please `}
        <Text as={'span'} textDecoration={'underline'} whiteSpace={'nowrap'}>
          {'contact us'}
        </Text>
        {`.`}
      </Text>
      <CustomLicenseType open={open} setOpen={setOpen} />
    </>
  )
}
