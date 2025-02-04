import { useValidationFeedback } from '@/commercelayer/components/forms/useValidationFeedback'
import { InputLabel } from '@/commercelayer/components/ui/InputLabel'
import { InputValidationError } from '@/commercelayer/components/ui/InputValidationError'
import { Field } from '@/components/ui/field'
import { Input as ChakraInput } from '@chakra-ui/react'
import { type InputHTMLAttributes } from 'react'
import { useFormContext } from 'react-hook-form'

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export const Input = ({
  name = '',
  label = '',
  type,
  ...props
}: Props): JSX.Element => {
  const form = useFormContext()
  const { hasError, errorMessage } = useValidationFeedback(name)
  return (
    <Field label={label} hasError={errorMessage} invalid={hasError}>
      <ChakraInput
        {...form?.register(name)}
        {...props}
        variant={'subtle'}
        type={type}
      />
    </Field>
  )
}
