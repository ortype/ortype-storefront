'use client'

import type { CollectionItem } from '@chakra-ui/react'
import {
  Box,
  Button,
  Select as ChakraSelect,
  Portal,
  useSelectItemContext,
} from '@chakra-ui/react'
import { ChevronDownIcon, ChevronRightIcon } from '@sanity/icons'
import * as React from 'react'
import { CloseButton } from './close-button'

interface SelectTriggerProps extends ChakraSelect.ControlProps {
  clearable?: boolean
}

const SelectTriggerIndicator = () => {
  return (
    <Box fontSize={'2rem'} w={8} ml={-1}>
      <ChevronDownIcon />
    </Box>
  )
}

export const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  SelectTriggerProps
>(function SelectTrigger(props, ref) {
  const { children, clearable, ...rest } = props
  return (
    <ChakraSelect.Control {...rest}>
      <ChakraSelect.Trigger
        ref={ref}
        cursor={'pointer'}
        pr={clearable ? '2rem' : '1rem'}
      >
        <SelectTriggerIndicator />
        {children}
      </ChakraSelect.Trigger>
      <ChakraSelect.IndicatorGroup>
        {clearable && <SelectClearTrigger />}
        {/*<ChakraSelect.Indicator />*/}
      </ChakraSelect.IndicatorGroup>
    </ChakraSelect.Control>
  )
})

const SelectClearTrigger = React.forwardRef<
  HTMLButtonElement,
  ChakraSelect.ClearTriggerProps
>(function SelectClearTrigger(props, ref) {
  return (
    <ChakraSelect.ClearTrigger asChild {...props} ref={ref}>
      <CloseButton
        size="xs"
        variant="plain"
        focusVisibleRing="inside"
        focusRingWidth="2px"
        pointerEvents="auto"
      />
    </ChakraSelect.ClearTrigger>
  )
})

interface SelectContentProps extends ChakraSelect.ContentProps {
  portalled?: boolean
  portalRef?: React.RefObject<HTMLElement>
}

export const SelectContent = React.forwardRef<
  HTMLDivElement,
  SelectContentProps
>(function SelectContent(props, ref) {
  const { portalled = true, portalRef, ...rest } = props
  return (
    <Portal disabled={!portalled} container={portalRef}>
      <ChakraSelect.Positioner>
        <ChakraSelect.Content {...rest} ref={ref} />
      </ChakraSelect.Positioner>
    </Portal>
  )
})

const SelectItemIndicatorCustom = ({ size = 'md' }) => {
  const { selected } = useSelectItemContext()
  const box = size == 'sm' ? '1rem' : '1.385rem'
  return (
    <Button
      className={'toggle-button'}
      variant={'circle'}
      w={box}
      borderWidth={'2px'}
      h={box}
      minW={box}
      p={0}
      bg={selected ? 'black' : 'white'}
      transition={'border-width 200ms ease-in-out'}
    />
  )
}

export const SelectItem = React.forwardRef<
  HTMLDivElement,
  ChakraSelect.ItemProps
>(function SelectItem(props, ref) {
  const { item, size, children, ...rest } = props
  return (
    <ChakraSelect.Item
      key={item.value}
      item={item}
      {...rest}
      ref={ref}
      _hover={{
        '& .toggle-button': {
          borderWidth: '3px',
        },
      }}
    >
      <SelectItemIndicatorCustom size={size} />
      {/*<ChakraSelect.ItemIndicator />*/}
      {children}
    </ChakraSelect.Item>
  )
})

interface SelectValueTextProps
  extends Omit<ChakraSelect.ValueTextProps, 'children'> {
  children?(items: CollectionItem[]): React.ReactNode
}

export const SelectValueText = React.forwardRef<
  HTMLSpanElement,
  SelectValueTextProps
>(function SelectValueText(props, ref) {
  const { children, ...rest } = props
  return (
    <ChakraSelect.ValueText {...rest} ref={ref}>
      <ChakraSelect.Context>
        {(select) => {
          const items = select.selectedItems
          if (items.length === 0) return props.placeholder
          if (children) return children(items)
          if (items.length === 1)
            return select.collection.stringifyItem(items[0])
          // show multiselect as `tag style` with `clear`
          return `${items.length} selected`
        }}
      </ChakraSelect.Context>
    </ChakraSelect.ValueText>
  )
})

export const SelectRoot = React.forwardRef<
  HTMLDivElement,
  ChakraSelect.RootProps
>(function SelectRoot(props, ref) {
  return (
    <ChakraSelect.Root
      {...props}
      ref={ref}
      // The sameWidth: true setting ensures the dropdown width matches the trigger width,
      // which will depend on the inner text when combined with width: 'auto' in the theme
      positioning={{ sameWidth: false, ...props.positioning }}
    >
      {props.asChild ? (
        props.children
      ) : (
        <>
          <ChakraSelect.HiddenSelect />
          {props.children}
        </>
      )}
    </ChakraSelect.Root>
  )
}) as ChakraSelect.RootComponent

interface SelectItemGroupProps extends ChakraSelect.ItemGroupProps {
  label: React.ReactNode
}

export const SelectItemGroup = React.forwardRef<
  HTMLDivElement,
  SelectItemGroupProps
>(function SelectItemGroup(props, ref) {
  const { children, label, ...rest } = props
  return (
    <ChakraSelect.ItemGroup {...rest} ref={ref}>
      <ChakraSelect.ItemGroupLabel>{label}</ChakraSelect.ItemGroupLabel>
      {children}
    </ChakraSelect.ItemGroup>
  )
})

export const SelectLabel = ChakraSelect.Label
export const SelectItemText = ChakraSelect.ItemText
