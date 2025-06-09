import { Flex } from '@chakra-ui/react'

import {
  NumberInputField,
  NumberInputLabel,
  NumberInputRoot,
} from '@/components/ui/number-input'
import type { NumberFormatOptions, ValueChangeDetails } from '@chakra-ui/react'
import { InputGroup, Text } from '@chakra-ui/react'

import debounce from 'lodash.debounce'
import React, { useCallback, useEffect, useRef, useMemo, useState } from 'react'

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
    min,
    max,
  } = props
  
  // Track internal state for the input value
  const [internalValue, setInternalValue] = useState<number | undefined>(
    value !== undefined ? value : defaultValue
  );
  
  // Update internal value when external value changes
  useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value);
    }
  }, [value]);

  // Create a stable handleChange function that calls the onChange prop
  const handleChange = useCallback(
    (val: number) => {
      // Update internal value
      setInternalValue(val);
      
      // Call external onChange handler
      if (props.onChange) {
        props.onChange(label, val);
      }
    },
    [label, props.onChange]
  );

  // Create a debounced version of handleChange
  const debouncedHandleChange = useMemo(() => {
    return debounceDelay > 0
      ? debounce(handleChange, debounceDelay)
      : handleChange;
  }, [handleChange, debounceDelay]);

  // Clean up the debounced function on unmount or when dependencies change
  useEffect(() => {
    return () => {
      if (debounceDelay > 0 && 'cancel' in debouncedHandleChange) {
        // @ts-ignore - lodash.debounce types don't include cancel, but it exists
        debouncedHandleChange.cancel();
        // Ensure any pending updates are applied
        if (internalValue !== undefined) {
          handleChange(internalValue);
        }
      }
    };
  }, [debouncedHandleChange, debounceDelay]);

  // Handler for value changes (arrow keys, typed input)
  const onValueChange = useCallback(
    (e: ValueChangeDetails) => {
      if (!isNaN(e.valueAsNumber)) {
        // Ensure we're using the numeric value
        const numericValue = e.valueAsNumber;
        
        // Apply min/max constraints if needed
        let constrainedValue = numericValue;
        if (min !== undefined && numericValue < min) {
          constrainedValue = min;
        }
        if (max !== undefined && numericValue > max) {
          constrainedValue = max;
        }
        
        // Use debounced updates for continuous input (like arrow keys)
        // This prevents too many updates when rapidly changing values
        debouncedHandleChange(constrainedValue);
      }
    },
    [debouncedHandleChange, min, max]
  );

  // Handler for blur events to ensure direct input is captured
  const onBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      // We need to force a value update on blur to ensure the typed value is applied
      const inputValue = e.target.value.trim();
      
      if (inputValue === '') {
        // Handle empty input - set to min, defaultValue or 0
        const emptyValue = min !== undefined ? min : defaultValue;
        // Use immediate update for blur events
        handleChange(emptyValue);
        return;
      }

      // Parse the value, handling any formatting
      // First remove any non-numeric characters except dots and minus signs
      const cleanedValue = inputValue.replace(/[^\d.-]/g, '');
      const numericValue = parseFloat(cleanedValue);
      
      if (!isNaN(numericValue)) {
        // Apply min/max constraints if needed
        let constrainedValue = numericValue;
        if (min !== undefined && numericValue < min) {
          constrainedValue = min;
        }
        if (max !== undefined && numericValue > max) {
          constrainedValue = max;
        }
        
        // Force the update on blur regardless of whether the value has changed
        // This ensures the typed value is applied even if it's the same as the current value
        // Use immediate update (non-debounced) for blur events
        handleChange(constrainedValue);
      }
    },
    [handleChange, min, max, defaultValue]
  );

  // Determine whether to use controlled or uncontrolled mode
  const isControlled = value !== undefined;
  
  // Prepare the numeric value to be used in the input
  // Chakra UI NumberInput expects numeric values, not strings
  const inputValue = isControlled 
    ? value 
    : internalValue;
    
  // Common props for NumberInputRoot
  const numberInputProps = {
    min,
    max,
    step,
    onValueChange,
    onBlur,
    // Pass numeric values to Chakra UI NumberInput, not strings
    ...(isControlled 
      ? { value: inputValue } 
      : { defaultValue }
    ),
    // Spread the rest of the props, but exclude those we've already handled
    ...Object.fromEntries(
      Object.entries(props).filter(
        ([key]) => !['onChange', 'value', 'defaultValue', 'label', 'usePointFormat', 'debounceDelay'].includes(key)
      )
    )
  };
  
  return (
    <Flex alignItems={`center`} position="relative">
      {usePointFormat ? (
        <InputGroup endElement="pt">
          <NumberInputRoot {...numberInputProps}>
            <NumberInputField fontSize={'sm'} h={'2rem'} />
          </NumberInputRoot>
        </InputGroup>
      ) : (
        <NumberInputRoot {...numberInputProps}>
          <NumberInputField fontSize={'sm'} h={'2rem'} />
        </NumberInputRoot>
      )}
    </Flex>
  )
}

export default NumericInput
