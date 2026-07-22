import {
  useBuyContext,
  type ToggleStyleParams,
} from '@/commercelayer/providers/buy'
import { Box, Collapsible, Flex, HStack, VStack } from '@chakra-ui/react'
import { ChevronDownIcon, ChevronRightIcon } from '@sanity/icons'
import React, { useState } from 'react'
import { SingleStyles } from './single-styles'

import ClearSelectionDialog from './clear-selection-dialog'
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

interface Props {
  // font: Font
  group: FontGroup
  variantToggleParams: ToggleStyleParams
  hasMultipleGroups: boolean
}

export const FontItem: React.FC<Props> = ({
  group,
  variantToggleParams,
  hasMultipleGroups,
}) => {
  const {
    font,
    toggleStyle,
    toggleGroup,
    selectedSkus,
    summary,
    groupSummaries,
  } = useBuyContext()

  const { allSelected: groupFullySelected } =
    groupSummaries[group.groupName] ?? false

  const [dialogOpen, setDialogOpen] = useState(false)

  const handleClick = () => {
    if (groupFullySelected) {
      setDialogOpen(true)
    } else {
      return null
    }
  }

  const onCancel = () => {
    setDialogOpen(false)
  }

  const onConfirm = () => {
    setDialogOpen(false)
    toggleGroup((group.allVariants || []).map(variantToggleParams))
  }

  return (
    <>
      <Flex direction={'column'} mb={0.5} gap={0} asChild>
        <Collapsible.Root defaultOpen={hasMultipleGroups ? false : true}>
          {/* Only show the sub-group header when the font has multiple groups */}
          {hasMultipleGroups && (
            <HStack gap={1}>
              <Collapsible.Trigger>
                <Collapsible.Context>
                  {({ open }) => (
                    <Box fontSize={'2rem'} w={8} ml={-1}>
                      {open ? <ChevronDownIcon /> : <ChevronRightIcon />}
                    </Box>
                  )}
                </Collapsible.Context>
              </Collapsible.Trigger>

              <Collapsible.Context>
                {({ open, setOpen }) => (
                  <FontGroup
                    name={font.shortName + ' ' + group.groupName}
                    group={group}
                    summary={groupSummaries[group.groupName]}
                    onToggle={() => {
                      toggleGroup(
                        (group.allVariants || []).map(variantToggleParams)
                      )
                      if (groupFullySelected) {
                        if (open) {
                          // currently toggling from groupFullySelected and open
                          setOpen(false)
                        }
                      } else {
                        // currently toggling from !groupFullySelected (will be groupFullySelected after)
                        setOpen(true)
                      }
                    }}
                  />
                )}
              </Collapsible.Context>
            </HStack>
          )}
          <Collapsible.Content pl={hasMultipleGroups ? 8 : 0} asChild>
            <VStack
              mt={groupFullySelected ? 0 : 0.5}
              gap={0.5}
              w={'full'}
              alignItems={'stretch'}
              pos={'relative'}
              onClick={handleClick}
            >
              {groupFullySelected && (
                <Box
                  _before={{
                    content: '""',
                    pos: 'absolute',
                    left: hasMultipleGroups ? 14 : 6,
                    top: 5,
                    bottom: 5,
                    w: 3,
                    borderLeft: '2px solid #000',
                    borderRadius: '4px',
                    borderTop: '2px solid #000',
                    borderBottom: '2px solid #000',
                    borderRight: '2px solid transparent',
                    zIndex: 0,
                  }}
                />
              )}
              {group.allVariants?.map((variant) => {
                if (!variant) return null
                return (
                  <SingleStyles
                    key={variant._id}
                    skuCode={variant._id}
                    className={variant._id}
                    name={`${font.shortName} ${variant.optionName}`}
                    isSelected={!!selectedSkus[variant._id]}
                    allSelected={groupFullySelected}
                    unitPrice={summary.unitPrice}
                    nextUnitPrice={summary.nextUnitPrice}
                    onToggle={() => toggleStyle(variantToggleParams(variant))}
                  />
                )
              })}
            </VStack>
          </Collapsible.Content>
        </Collapsible.Root>
      </Flex>
      <ClearSelectionDialog
        open={dialogOpen}
        onCancel={onCancel}
        onConfirm={onConfirm}
      />
    </>
  )
}

export default FontItem
