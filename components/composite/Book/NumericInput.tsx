import {
  Flex,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
} from '@chakra-ui/react'
import debounce from 'lodash.debounce'
import React, { useCallback, useState } from 'react'

interface NumericInputProps {
  value: number
  onChange: (val: number) => void
}

const NumericInput: React.FC<NumericInputProps> = (props) => {
  const { value } = props
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

  return (
    <Flex alignItems={`center`}>
      <NumberInput value={inputValue} onChange={handleInputChange}>
        <NumberInputField />
        <NumberInputStepper>
          <NumberIncrementStepper onClick={handleIncrementButton} />
          <NumberDecrementStepper onClick={handleDecrementButton} />
        </NumberInputStepper>
      </NumberInput>
    </Flex>
  )
}

export default NumericInput
