import { RadioCard } from '@chakra-ui/react'
import * as React from 'react'

interface RadioCardItemProps extends RadioCard.ItemProps {
  isSelected?: boolean
  icon?: React.ReactElement
  label?: React.ReactNode
  description?: React.ReactNode
  addon?: React.ReactNode
  indicator?: React.ReactNode | null
  indicatorPlacement?: 'start' | 'end' | 'inside'
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>
}

export const RadioCardItem = React.forwardRef<
  HTMLInputElement,
  RadioCardItemProps
>(function RadioCardItem(props, ref) {
  const {
    isSelected,
    inputProps,
    label,
    description,
    addon,
    icon,
    indicator = <RadioCard.ItemIndicator className="dot" />,
    indicatorPlacement = 'end',
    ...rest
  } = props

  const hasContent = label || description || icon
  const ContentWrapper = indicator ? RadioCard.ItemContent : React.Fragment

  return (
    <RadioCard.Item
      {...rest}
      _hover={{
        '& .dot': {
          bg: 'colorPalette.fg',
        },
      }}
      _checked={{
        _hover: {
          '& .dot': {
            bg: 'colorPalette.fg',
          },
        },
      }}
    >
      <RadioCard.ItemHiddenInput ref={ref} {...inputProps} />
      <RadioCard.ItemControl alignItems={'center'}>
        {indicatorPlacement === 'start' && indicator}
        {hasContent && (
          <ContentWrapper>
            {icon}
            {label && <RadioCard.ItemText>{label}</RadioCard.ItemText>}
            {description && (
              <RadioCard.ItemDescription>
                {description}
              </RadioCard.ItemDescription>
            )}
            {indicatorPlacement === 'inside' && indicator}
          </ContentWrapper>
        )}
        {indicatorPlacement === 'end' && indicator}
      </RadioCard.ItemControl>
      {addon && <RadioCard.ItemAddon>{addon}</RadioCard.ItemAddon>}
    </RadioCard.Item>
  )
})

export const RadioCardRoot = RadioCard.Root
export const RadioCardLabel = RadioCard.Label
export const RadioCardItemIndicator = RadioCard.ItemIndicator
