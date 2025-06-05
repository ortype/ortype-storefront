import { Flex } from '@chakra-ui/react'

import {
  NumberInputField,
  NumberInputLabel,
  NumberInputRoot,
} from '@/components/ui/number-input'
import type { NumberFormatOptions, ValueChangeDetails } from '@chakra-ui/react'
import { InputGroup, Text } from '@chakra-ui/react'

import debounce from 'lodash.debounce'
import React, { useCallback } from 'react'

interface NumericInputProps {
  value?: number
  label: string
  onChange?: (key: string, val: number) => void
  defaultValue?: number
  step?: number
  withScrubber?: boolean
  min?: number
  max?: number
  formatOptions?: NumberFormatOptions
  /** Set to true to display the value with 'pt' suffix */
  usePointFormat?: boolean
  /**
   * Debounce delay in milliseconds
   * Set to 0 to disable debounce
   * @default 500
   */
  debounceDelay?: number
}

const NumericInput: React.FC<NumericInputProps> = (props) => {
  const {
    value,
    label,
    step,
    defaultValue = 0,
    usePointFormat = false,
    debounceDelay = 500,
  } = props

  const onChange = useCallback(
    debounceDelay > 0
      ? debounce((val: number) => {
          // handle your change logic here
          if (props.onChange) {
            props.onChange(label, val)
          }
        }, debounceDelay)
      : // No debounce when debounceDelay is 0
        (val: number) => {
          if (props.onChange) {
            props.onChange(label, val)
          }
        },
    [label, props.onChange, debounceDelay]
  )

  return (
    <Flex alignItems={`center`} position="relative">
      {usePointFormat ? (
        <InputGroup endElement="pt">
          <NumberInputRoot
            value={value !== undefined ? value.toString() : ''}
            defaultValue={
              defaultValue !== undefined ? defaultValue.toString() : '0'
            }
            onValueChange={(e: ValueChangeDetails) => onChange(e.valueAsNumber)}
            {...props}
          >
            <NumberInputField fontSize={'sm'} h={'2rem'} />
          </NumberInputRoot>
        </InputGroup>
      ) : (
        <NumberInputRoot
          value={value !== undefined ? value.toString() : ''}
          defaultValue={
            defaultValue !== undefined ? defaultValue.toString() : '0'
          }
          step={step}
          onValueChange={(e: ValueChangeDetails) => onChange(e.valueAsNumber)}
          {...props}
        >
          <NumberInputField fontSize={'sm'} h={'2rem'} />
        </NumberInputRoot>
      )}
    </Flex>
  )
}

export default NumericInput
