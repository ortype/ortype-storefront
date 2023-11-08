import {
  Flex,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
} from '@chakra-ui/react'
import React, { useState } from 'react'

const NumericInput = (props) => {
  const { value } = props
  const [inputValue, setInputValue] = useState(value || 0)

  const onChange = (val) => {
    setInputValue(val)
    if (props.onChange) {
      props.onChange(val)
    }
  }

  const handleInputChange = (val) => {
    const numericValue = Number(val)
    console.log('handleInputChange: ', val, numericValue)

    if (Number.isNaN(numericValue)) return
    onChange(numericValue)
  }

  const handleIncrementButton = () => {
    onChange(inputValue + 1)
  }

  const handleDecrementButton = () => {
    onChange(inputValue - 1)
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
