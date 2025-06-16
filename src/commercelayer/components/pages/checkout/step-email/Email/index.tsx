import { Input } from '@/commercelayer/components/ui/Input'
import { useCheckoutContext } from '@/commercelayer/providers/checkout'
import { Button } from '@/components/ui/chakra-button'
import { Field } from '@/components/ui/field'
import {
  Box,
  Input as ChakraInput,
  Container,
  Fieldset,
} from '@chakra-ui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

const emailSchema = z.object({
  customer_email: z
    .string()
    .email('Please enter a valid email address')
    .min(1, 'Email is required'),
})

type EmailFormData = z.infer<typeof emailSchema>

interface Props {
  readonly?: boolean
  setCustomerEmail?: (email: string) => void
  emailAddress?: string
}

export const Email: React.FC<Props> = ({
  readonly,
  setCustomerEmail,
  emailAddress,
}) => {
  const { t } = useTranslation()
  const { saveCustomerUser } = useCheckoutContext()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      customer_email: emailAddress || '',
    },
  })

  const {
    handleSubmit,
    formState: { errors },
  } = form

  const onSubmit = async (data: EmailFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await saveCustomerUser(data.customer_email)

      if (result.success) {
        // Also call the legacy setCustomerEmail if provided for backward compatibility
        if (setCustomerEmail) {
          setCustomerEmail(data.customer_email)
        }
      } else {
        setError(result.error?.message || 'Failed to save email')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save email')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Fieldset.Root size="lg" maxW="md">
          <Fieldset.Content>
            <Input
              name="customer_email"
              label={t('addressForm.customer_email')}
              type="email"
              data-testid="customer_email"
              disabled={readonly || isLoading}
            />
            {error && (
              <Box color="red.500" fontSize="sm" mt={2}>
                {error}
              </Box>
            )}
            <Button
              type="submit"
              variant={'outline'}
              alignSelf="flex-end"
              isLoading={isLoading}
              disabled={readonly}
            >
              {isLoading ? 'Saving...' : 'Save'}
            </Button>
          </Fieldset.Content>
        </Fieldset.Root>
      </form>
    </FormProvider>
  )
}
