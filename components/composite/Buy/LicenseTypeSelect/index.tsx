import { useOrderContainer } from '@commercelayer/react-components'
import { CommerceLayerClient, SkuOption } from '@commercelayer/sdk'
import { Type } from 'lib/settings'
import React, { useState } from 'react'
import Select from 'react-select'

interface Props {
  cl: CommerceLayerClient
  skuOptions: SkuOption[]
  selectedSkuOptions: SkuOption[]
  font: any
  setSelectedSkuOptions: () => void
}

export const LicenseTypeSelect: React.FC<Props> = ({
  cl,
  font,
  skuOptions,
  selectedSkuOptions,
  setSelectedSkuOptions,
}) => {
  const { order } = useOrderContainer()

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

  const [selectedTypes, setSelectedTypes] = useState<Type[]>([typeOptions[0]])

  const handleTypeChange = (selectedOptions: any) => {
    console.log('selectedOptions: ', selectedOptions)
    // @TODO: review this logic
    // this is only interesting if we want to select skuOptions
    const selectedSkuOptions = selectedOptions.map((option: any) =>
      skuOptions.find((type) => type.reference === option.value)
    )
    setSelectedTypes(selectedOptions) // update Select component state

    console.log('selectedSkuOptions: ', selectedSkuOptions)
    setSelectedSkuOptions({ selectedSkuOptions, font })
    // @TODO: on changing selected SKU options, update all line_items on the order
  }

  return (
    <>
      <Select
        placeholder={'Select a type'}
        options={typeOptions}
        isMulti
        value={selectedTypes}
        onChange={handleTypeChange}
      />
    </>
  )
}
