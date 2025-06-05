import { NumberInput as ChakraNumberInput, InputGroup } from '@chakra-ui/react'
import * as React from 'react'
import { LuArrowRightLeft } from 'react-icons/lu'

export interface NumberInputProps extends ChakraNumberInput.RootProps {}

export const NumberInputRoot = React.forwardRef<
  HTMLDivElement,
  NumberInputProps
>(function NumberInput(props, ref) {
  const { children, withScrubber = false, ...rest } = props
  return (
    <ChakraNumberInput.Root ref={ref} variant="outline" {...rest}>
      <ChakraNumberInput.Control />
      {withScrubber ? (
        <InputGroup
          startElementProps={{ pointerEvents: 'auto' }}
          startElement={
            <ChakraNumberInput.Scrubber>
              <LuArrowRightLeft />
            </ChakraNumberInput.Scrubber>
          }
        >
          {children}
        </InputGroup>
      ) : (
        <>
          {children}
          <ChakraNumberInput.Control>
            <ChakraNumberInput.IncrementTrigger />
            <ChakraNumberInput.DecrementTrigger />
          </ChakraNumberInput.Control>
        </>
      )}
    </ChakraNumberInput.Root>
  )
})

export const NumberInputField = ChakraNumberInput.Input
export const NumberInputScrubber = ChakraNumberInput.Scrubber
export const NumberInputLabel = ChakraNumberInput.Label
