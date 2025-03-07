import type { FontVariant } from '@/sanity/lib/queries'

import {
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
} from '@/components/ui/chakra-select'
import { createListCollection } from '@chakra-ui/react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

interface Option {
  label: string
  value: string
}

interface Props {
  currentVariantId: string
  styleGroups: {
    groupName: string
    variants?: FontVariant[]
    italicVariants?: FontVariant[]
  }[]
  handleVariantChange: (value: string[]) => void
}

export const TieredSelect: React.FC<Props> = (props) => {
  const { styleGroups, currentVariantId, handleVariantChange } = props

  // Find which group contains the current variant
  const findInitialGroup = () => {
    for (const group of styleGroups) {
      const allVariants = [
        ...(group.variants || []),
        ...(group.italicVariants || []),
      ]
      if (allVariants.some((v) => v._id === currentVariantId)) {
        return group.groupName
      }
    }
    return styleGroups[0]?.groupName || ''
  }

  // State to track the currently selected group
  const [selectedGroup, setSelectedGroup] = useState(findInitialGroup())

  // Ref to track the previous selected group
  const prevGroupRef = useRef<string>(selectedGroup)

  // Get the selected group object
  const currentGroup =
    styleGroups.find((group) => group.groupName === selectedGroup) ||
    styleGroups[0]

  // Combine variants and italicVariants from the selected group
  const groupVariants = useMemo(
    () => [
      ...(currentGroup?.variants || []),
      ...(currentGroup?.italicVariants || []),
    ],
    [currentGroup]
  )

  // Find the index of currently selected variant within a specified group
  const findVariantIndex = useCallback(
    (groupName: string, variantId: string) => {
      const group = styleGroups.find((g) => g.groupName === groupName)
      if (!group) return 0

      const groupVariants = [
        ...(group.variants || []),
        ...(group.italicVariants || []),
      ]

      const index = groupVariants.findIndex((v) => v._id === variantId)
      return index !== -1 ? index : 0 // Return 0 as fallback when variant isn't found
    },
    [styleGroups]
  )

  // When the selected group changes, maintain the same index position
  useEffect(() => {
    if (styleGroups.length <= 1) return

    // Only run this effect when the selected group changes
    if (prevGroupRef.current !== selectedGroup) {
      // Get the index of the current variant in the previous group
      const prevIndex = findVariantIndex(prevGroupRef.current, currentVariantId)

      // Get the new group and its variants
      const newGroup = styleGroups.find(
        (group) => group.groupName === selectedGroup
      )

      if (!newGroup) return

      const newGroupVariants = [
        ...(newGroup.variants || []),
        ...(newGroup.italicVariants || []),
      ]

      // If there are no variants in the new group, return early
      if (newGroupVariants.length === 0) return

      // If there's a variant at the same index, select it
      if (newGroupVariants.length > prevIndex) {
        const newVariantId = newGroupVariants[prevIndex]._id
        if (newVariantId !== currentVariantId) {
          handleVariantChange([newVariantId])
        }
      } else {
        // If the index doesn't exist in the new group, use the first variant
        const newVariantId = newGroupVariants[0]._id
        if (newVariantId !== currentVariantId) {
          handleVariantChange([newVariantId])
        }
      }

      // Update the previous group ref
      prevGroupRef.current = selectedGroup
    }
  }, [selectedGroup, currentVariantId, styleGroups, handleVariantChange])

  // Create options for the group select
  const groupOptions = useMemo(
    () =>
      styleGroups.map((group) => ({
        label: group.groupName,
        value: group.groupName,
      })),
    [styleGroups]
  )

  // Create options for the variant select based on selected group
  const variantOptions = useMemo(
    () =>
      groupVariants.map((variant) => ({
        label: variant.shortName || variant.optionName,
        value: variant._id,
      })),
    [groupVariants]
  )

  // Create collections for both selects
  const groupCollection = useMemo(
    () => createListCollection({ items: groupOptions }),
    [groupOptions]
  )

  const variantCollection = useMemo(
    () => createListCollection({ items: variantOptions }),
    [variantOptions]
  )

  return (
    <>
      {/* Group Select - only show when there are multiple style groups */}
      {styleGroups.length > 1 && (
        <SelectRoot
          variant={'flushed'}
          size={'sm'}
          fontSize={'md'}
          collection={groupCollection}
          value={[selectedGroup]}
          onValueChange={useCallback((e) => setSelectedGroup(e.value[0]), [])}
        >
          <SelectTrigger>
            <SelectValueText fontSize={'md'} placeholder="Select group" />
          </SelectTrigger>
          <SelectContent>
            {groupCollection.items.map((item) => (
              <SelectItem item={item} key={item.value} fontSize={'md'}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </SelectRoot>
      )}

      {/* Variant Select */}
      <SelectRoot
        variant={'flushed'}
        size={'sm'}
        collection={variantCollection}
        value={[currentVariantId]}
        onValueChange={useCallback(
          (e) => {
            handleVariantChange(e.value)
          },
          [handleVariantChange]
        )}
      >
        <SelectTrigger>
          <SelectValueText placeholder="Select style" fontSize={'md'} />
        </SelectTrigger>
        <SelectContent>
          {variantCollection.items.map((item) => (
            <SelectItem item={item} key={item.value} fontSize={'md'}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </SelectRoot>
    </>
  )
}
