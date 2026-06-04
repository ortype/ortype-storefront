import { useBuyContext } from '@/commercelayer/providers/buy'
import { useOrderContext } from '@/commercelayer/providers/Order'
import { Flex } from '@chakra-ui/react'
import React, { useMemo } from 'react'
import { SingleStyles } from './single-styles'

import { getLineItemSibilingCount } from '@/commercelayer/utils/prices'
import { FontFull } from './font-full'
import { FontGroup } from './font-group'

interface FontVariant {
  _id: string
  optionName: string
  parentUid: string
}

export interface FontGroup {
  _type: string
  groupName: string
  variants: FontVariant[]
  italicVariants: FontVariant[]
  allVariants?: FontVariant[]
}

const mergeVariants = (group: FontGroup): FontVariant[] => {
  const merged: FontVariant[] = []
  const variants = group.variants || []
  const italicVariants = group.italicVariants || []
  const maxLength = Math.max(variants.length, italicVariants.length)

  for (let i = 0; i < maxLength; i++) {
    if (i < variants.length) {
      merged.push(variants[i])
    }
    if (i < italicVariants.length) {
      merged.push(italicVariants[i])
    }
  }

  return merged
}

interface YourComponentProps {
  data: FontGroup[]
}

export const Typefaces = ({ unitPrice, nextUnitPrice, fontLineItemCount }) => {
  const { font, addLineItem, selectedSkus } = useBuyContext()
  const { order, licenseSize, selectedSkuOptions } = useOrderContext()

  // @TODO: on changing selected SKU options, update all line_items on the order

  const mergedData = useMemo<FontGroup[]>(() => {
    return font.styleGroups?.map((group) => ({
      ...group,
      allVariants: mergeVariants(group),
    }))
  }, [font.styleGroups])

  return font.styleGroups ? (
    <Flex direction={'column'} mt={1} mb={1} gap={'3px'}>
      <FontFull font={font} unitPrice={unitPrice} />
      {mergedData.map((group) => (
        <Flex key={font._id} direction={'column'} mt={'3px'} mb={1} gap={'3px'}>
          <FontGroup
            name={font.shortName + ' ' + group.groupName}
            group={group}
            unitPrice={unitPrice}
          />
          {group.allVariants?.map((variant) => {
            if (!variant) null
            const existingLineItem = order?.line_items?.find(
              (li) => li.sku_code === variant._id
            )
            const count =
              existingLineItem && order?.line_items
                ? getLineItemSibilingCount(existingLineItem, order.line_items)
                : fontLineItemCount > 0
                ? fontLineItemCount + 1
                : 0
            return (
              <SingleStyles
                key={variant._id}
                skuCode={variant._id}
                className={variant._id}
                selectedSkuOptions={selectedSkuOptions}
                licenseSize={licenseSize}
                unitPrice={unitPrice}
                nextUnitPrice={nextUnitPrice}
                siblingCount={count}
                parentUid={variant.parentUid}
                parentName={font.shortName}
                defaultVariantId={font.defaultVariant?._id}
                selectedSkus={selectedSkus}
                addLineItem={addLineItem}
                name={`${font.shortName} ${variant.optionName}`}
              />
            )
          })}
        </Flex>
      ))}
    </Flex>
  ) : (
    <Flex direction={'column'} mt={0.5} mb={1} gap={0.5}>
      <FontFull font={font} unitPrice={unitPrice} />
      {font.variants?.map((variant) => {
        // If this variant is already a line item, use its real position;
        // otherwise it would be added at the end of the group
        if (!variant) return null
        const existingLineItem = order?.line_items?.find(
          (li) => li.sku_code === variant._id
        )
        const count =
          existingLineItem && order?.line_items
            ? getLineItemSibilingCount(existingLineItem, order.line_items)
            : fontLineItemCount > 0
            ? fontLineItemCount + 1
            : 0

        // fontLineItemCount is 0 if no items are added

        return (
          <SingleStyles
            key={variant._id}
            skuCode={variant._id}
            className={variant._id}
            selectedSkuOptions={selectedSkuOptions}
            licenseSize={licenseSize}
            unitPrice={unitPrice}
            nextUnitPrice={nextUnitPrice}
            siblingCount={count}
            parentUid={variant.parentUid}
            parentName={font.shortName}
            defaultVariantId={font.defaultVariant?._id}
            selectedSkus={selectedSkus}
            addLineItem={addLineItem}
            name={`${font.shortName} ${variant.optionName}`}
          />
        )
      })}
    </Flex>
  )
}

export default Typefaces
