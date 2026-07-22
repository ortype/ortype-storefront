import {
  useBuyContext,
  type ToggleStyleParams,
} from '@/commercelayer/providers/buy'
import { Box, Collapsible, Flex, HStack, VStack } from '@chakra-ui/react'
import { ChevronDownIcon, ChevronRightIcon } from '@sanity/icons'
import React, { useMemo } from 'react'
import { SingleStyles } from './single-styles'

import { FontFull } from './font-full'
import { FontGroup } from './font-group'
import FontItem from './font-item'

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

export const Typefaces = () => {
  const {
    font,
    toggleStyle,
    toggleGroup,
    selectedSkus,
    summary,
    fullFamilySummary,
    groupSummaries,
  } = useBuyContext()

  const mergedData = useMemo<FontGroup[]>(() => {
    return font.styleGroups?.map((group) => ({
      ...group,
      allVariants: mergeVariants(group),
    }))
  }, [font.styleGroups])

  /** Build toggle params for a variant */
  const variantToggleParams = (variant: FontVariant): ToggleStyleParams => ({
    skuCode: variant._id,
    name: `${font.shortName} ${variant.optionName}`,
    className: variant._id,
  })

  const hasMultipleGroups = (font.styleGroups?.length ?? 0) > 1

  return font.styleGroups ? (
    <Flex direction={'column'} mt={1} mb={1} gap={0}>
      <FontFull
        font={font}
        summary={fullFamilySummary}
        hasMultipleGroups={hasMultipleGroups}
        onToggle={() => toggleGroup(font.variants.map(variantToggleParams))}
      />
      {mergedData.map((group) => (
        <FontItem
          key={group.groupName}
          group={group}
          hasMultipleGroups={hasMultipleGroups}
          variantToggleParams={variantToggleParams}
        />
      ))}
    </Flex>
  ) : (
    <Flex direction={'column'} mt={0.5} mb={1} gap={0.5}>
      <FontFull
        font={font}
        summary={fullFamilySummary}
        onToggle={() => toggleGroup(font.variants.map(variantToggleParams))}
      />
      {font.variants?.map((variant) => {
        if (!variant) return null
        return (
          <SingleStyles
            key={variant._id}
            skuCode={variant._id}
            className={variant._id}
            name={`${font.shortName} ${variant.optionName}`}
            isSelected={!!selectedSkus[variant._id]}
            unitPrice={summary.unitPrice}
            nextUnitPrice={summary.nextUnitPrice}
            onToggle={() => toggleStyle(variantToggleParams(variant))}
          />
        )
      })}
    </Flex>
  )
}

export default Typefaces
