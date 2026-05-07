import LicenseOwnerInput from '@/commercelayer/components/forms/LicenseOwnerInput'
import { LicenseSizeList } from '@/commercelayer/components/forms/LicenseSizeList'
import { LicenseTypeList } from '@/commercelayer/components/forms/LicenseTypeList'
import { CheckoutButton } from '@/commercelayer/components/ui/checkout-button'
import { FieldsetLegend } from '@/commercelayer/components/ui/fieldset-legend'
import { getFontReferenceCounts } from '@/commercelayer/components/ui/order-summary'
import { useBuyContext } from '@/commercelayer/providers/buy'
import { useOrderContext } from '@/commercelayer/providers/Order'
import {
  Box,
  Button,
  Center,
  Circle,
  Container,
  Fieldset,
  Flex,
  GridItem,
  Link,
  Portal,
  Show,
  SimpleGrid,
  Spinner,
  Stack,
  Text,
  VStack,
} from '@chakra-ui/react'
import React, { useMemo } from 'react'
import { SingleStyles } from './single-styles'

import {
  calculateLineItemPrice,
  calculateSkuOptionsTotal,
  formatPrice,
  getLineItemPosition,
  getLineItemSibilingCount,
} from '@/commercelayer/utils/prices'
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
  const maxLength = Math.max(group.variants.length, group.italicVariants.length)

  for (let i = 0; i < maxLength; i++) {
    if (i < group.variants.length) {
      merged.push(group.variants[i])
    }
    if (i < group.italicVariants.length) {
      merged.push(group.italicVariants[i])
    }
  }

  return merged
}

interface YourComponentProps {
  data: FontGroup[]
}

export const Typefaces = ({ unitPrice, fontLineItemCount }) => {
  const { font, addLineItem } = useBuyContext()
  const { order, licenseSize, deleteLineItem, selectedSkuOptions } =
    useOrderContext()

  // @TODO: on changing selected SKU options, update all line_items on the order

  const mergedData = useMemo<FontGroup[]>(() => {
    return font.styleGroups?.map((group) => ({
      ...group,
      allVariants: mergeVariants(group),
    }))
  }, [font.styleGroups])

  return font.styleGroups ? (
    <Flex direction={'column'} mt={1} mb={1} gap={0.5}>
      <FontFull font={font} unitPrice={unitPrice} />
      {mergedData.map((group) => (
        <Flex key={font._id} direction={'column'} mt={0.5} mb={1} gap={0.5}>
          <FontGroup
            name={font.shortName + ' ' + group.groupName}
            group={group}
            unitPrice={unitPrice}
          />
          {group.allVariants?.map((variant) => {
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
                siblingCount={count}
                parentUid={variant.parentUid}
                addLineItem={addLineItem}
                deleteLineItem={deleteLineItem}
                order={order}
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
            siblingCount={count}
            parentUid={variant.parentUid}
            addLineItem={addLineItem}
            deleteLineItem={deleteLineItem}
            order={order}
            name={`${font.shortName} ${variant.optionName}`}
          />
        )
      })}
    </Flex>
  )
}

export default Typefaces
