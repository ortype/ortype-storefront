import { useValidationFeedback } from '@/commercelayer/components/forms/useValidationFeedback'
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
    <Field label={label} errorText={errorMessage} invalid={hasError}>
      <ChakraInput
        {...form?.register(name)}
        variant={'subtle'}
        size={'lg'}
        fontSize={'lg'}
        mt={1}
        borderRadius={0}
        type={type}
        {...props}
      />
    </Field>
  )
}
