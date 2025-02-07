import type { Font, FontVariant } from '@/sanity/lib/queries'

import {
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
} from '@/components/ui/chakra-select'
import { createListCollection } from '@chakra-ui/react'
import { useState } from 'react'

interface Option {
  label: string
  value: string
}

interface Props {
  currentVariantId: string
  variantOptions: Option[]
  handleVariantChange: (value: string[]) => void
}

export const TieredSelect: React.FC<Props> = (props) => {
  const { variantOptions, currentVariantId, handleVariantChange } = props
  const collection = createListCollection({ items: variantOptions })

  return (
    <SelectRoot
      variant={'outline'}
      size={'sm'}
      collection={collection}
      width="7rem"
      value={[currentVariantId]}
      onValueChange={(e) => handleVariantChange(e.value)}
    >
      <SelectTrigger>
        <SelectValueText placeholder="Select style" />
      </SelectTrigger>
      <SelectContent>
        {collection.items.map((item) => (
          <SelectItem item={item} key={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </SelectRoot>
  )
}
