import { FloatingLabelInput } from '@/commercelayer/components/ui/floating-label-input'
import { forwardRef, type InputHTMLAttributes } from 'react'

interface AddressFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  value?: string
  onChange?: (value: string) => void
}

/**
 * AddressField - A thin wrapper around FloatingLabelInput component with error display.
 * Designed for use in address forms with consistent styling and error handling.
 */
export const AddressField = forwardRef<HTMLInputElement, AddressFieldProps>(
  ({ label, error, value, onChange, ...props }, ref) => {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(event.target.value)
      props.onChange?.(event)
    }

    return (
      <FloatingLabelInput
        ref={ref}
        {...props}
        label={label}
        error={error}
        variant="subtle"
        size="lg"
        fontSize="md"
        borderRadius={0}
        value={value}
        onChange={handleChange}
      />
    )
  }
)

AddressField.displayName = 'AddressField'
