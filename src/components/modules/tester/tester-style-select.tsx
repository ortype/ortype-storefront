'use client'

import { Flex, chakra } from '@chakra-ui/react'
import { useId } from 'react'
import type { Font } from '@/types'

export default function TesterStyleSelect({
  font,
  variantId,
  onChange,
}: {
  font: Font
  variantId: string
  onChange: (id: string) => void
}) {
  const id = useId()
  const groups = font.styleGroups.flatMap((group, index) => {
    const variants = [...group.variants, ...group.italicVariants].filter(
      (variant) => variant?._id
    )
    return variants.length
      ? [
          {
            id: `group-${index}`,
            name: group.groupName || 'Standard',
            variants,
          },
        ]
      : []
  })
  const groupedIds = new Set(
    groups.flatMap((group) => group.variants.map((variant) => variant._id))
  )
  const ungrouped = font.variants.filter(
    (variant) => variant?._id && !groupedIds.has(variant._id)
  )
  if (ungrouped.length) {
    groups.push({
      id: 'ungrouped',
      name: groups.length ? 'Other styles' : 'Standard',
      variants: ungrouped,
    })
  }
  const group =
    groups.find((item) =>
      item.variants.some((variant) => variant._id === variantId)
    ) ?? groups[0]
  if (!group) return null

  const selectStyles = {
    bg: 'white',
    color: 'black',
    border: 0,
    borderBottom: '1px solid black',
    borderRadius: 0,
    px: 2,
    py: 1,
    maxW: '100%',
    minW: 0,
    fontSize: 'md',
    cursor: 'pointer',
    _focusVisible: { outline: '2px solid black', outlineOffset: '3px' },
  } as const

  return (
    <Flex justify='center' align='center' gap={4} wrap='wrap' width='100%'>
      {groups.length > 1 && (
        <chakra.select
          id={`${id}-group`}
          aria-label='Font group'
          value={group.id}
          css={selectStyles}
          onChange={(event) => {
            const nextGroup = groups.find(
              (item) => item.id === event.target.value
            )
            const index = group.variants.findIndex(
              (variant) => variant._id === variantId
            )
            const next = nextGroup?.variants[index] ?? nextGroup?.variants[0]
            if (next) onChange(next._id)
          }}
        >
          {groups.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </chakra.select>
      )}
      {group.variants.length > 1 ? (
        <chakra.select
          id={`${id}-style`}
          aria-label='Font style'
          value={variantId}
          css={selectStyles}
          onChange={(event) => onChange(event.target.value)}
        >
          {group.variants.map((variant) => (
            <option key={variant._id} value={variant._id}>
              {variant.optionName}
            </option>
          ))}
        </chakra.select>
      ) : (
        <chakra.span fontSize='md'>
          {group.variants[0].optionName}
        </chakra.span>
      )}
    </Flex>
  )
}
