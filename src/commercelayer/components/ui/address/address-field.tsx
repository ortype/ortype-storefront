import { Field } from '@/components/ui/field'
import { Input as ChakraInput } from '@chakra-ui/react'
import { forwardRef, type InputHTMLAttributes } from 'react'

interface AddressFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  value?: string
  onChange?: (value: string) => void
}

/**
 * AddressField - A thin wrapper around Input component with error display.
 * Designed for use in address forms with consistent styling and error handling.
 */
export const AddressField = forwardRef<HTMLInputElement, AddressFieldProps>(
  ({ label, error, value, onChange, ...props }, ref) => {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(event.target.value)
      props.onChange?.(event)
    }

    return (
      <Field label={label} errorText={error} invalid={!!error}>
        <ChakraInput
          ref={ref}
          {...props}
          variant="subtle"
          value={value}
          onChange={handleChange}
        />
      </Field>
    )
  }
)

AddressField.displayName = 'AddressField'
