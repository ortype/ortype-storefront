import { Flex } from '@chakra-ui/react'

import {
  NumberInputField,
  NumberInputLabel,
  NumberInputRoot,
} from '@/components/ui/number-input'

import debounce from 'lodash.debounce'
import React, { useCallback, useState } from 'react'

interface NumericInputProps {
  value: number
  onChange: (val: number) => void
}

const NumericInput: React.FC<NumericInputProps> = (props) => {
  const { value } = props
  /*
  // @TODO: check if we still need a controlled component for chakra-ui v3
  const [inputValue, setInputValue] = useState(value || 0)

  const onChange = useCallback(
    debounce((val: number) => {
      // handle your change logic here
      if (props.onChange) {
        props.onChange(val)
      }
    }, 500), // Adjust the time (in milliseconds) as needed
    []
  )

  const handleInputChange = (val) => {
    const numericValue = Number(val)
    console.log('handleInputChange: ', val, numericValue)

    // numericValue !== '-' @TODO: this prevents typing in negative values
    if (val === '-') {
      setInputValue(val)
      return
    }

    if (Number.isNaN(numericValue)) return
    setInputValue(numericValue)
    onChange(numericValue)
  }

  const handleIncrementButton = () => {
    onChange(inputValue + 1)
    setInputValue(inputValue + 1)
  }

  const handleDecrementButton = () => {
    onChange(inputValue - 1)
    setInputValue(inputValue - 1)
  }
  */

  return (
    <Flex alignItems={`center`}>
      <NumberInputRoot value={value}>
        <NumberInputField fontSize={'sm'} h={'2rem'} />
      </NumberInputRoot>
    </Flex>
  )
}

export default NumericInput
