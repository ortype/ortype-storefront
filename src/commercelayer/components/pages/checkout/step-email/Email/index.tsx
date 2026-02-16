import { Input } from '@/commercelayer/components/ui/Input'
// import { FloatingLabelInput } from '@/commercelayer/components/ui/floating-label-input'
import { useCheckoutContext } from '@/commercelayer/providers/checkout'
import { Button } from '@/components/ui/chakra-button'
import { Box, Center, Container, Fieldset, VStack } from '@chakra-ui/react'
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

      console.log('Email onSubmit: ', result)

      if (result.success) {
        console.log('✅ Email saved successfully')
        // Note: Do not advance step here - this is part 1 of 2-part auth step
        // Step advancement happens after successful login/signup in part 2
        setCustomerEmail(data.customer_email)
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
      <form data-step="email" onSubmit={handleSubmit(onSubmit)}>
        <Fieldset.Root size="lg" maxW="lg">
          <Fieldset.Content asChild>
            <VStack gap={2}>
              <Input
                name="customer_email"
                label={t('addressForm.customer_email')}
                type="email"
                data-testid="customer_email"
                disabled={readonly || isLoading}
                size={'2xl'}
                minW={'30rem'}
                fontSize={'2xl'}
              />
              {/* @TODO: test floatinglabelinput
                // it's a controlled input however
             */}
              {/*<FloatingLabelInput
              label="Cardholder Name"
              value={cardholderName}
              onChange={(e) => setCardholderName(e.target.value)}
              variant="subtle"
              size="lg"
              fontSize="md"
              borderRadius={0}
            />*/}
              {error && (
                <Box color="red.500" fontSize="sm" mt={2}>
                  {error}
                </Box>
              )}
              <Button
                type="submit"
                alignSelf="flex-end"
                loading={isLoading}
                disabled={readonly}
                variant={'outline'}
                bg={'white'}
                borderRadius={'5rem'}
                size={'sm'}
                fontSize={'md'}
              >
                {isLoading ? 'Saving...' : 'Save'}
              </Button>
            </VStack>
          </Fieldset.Content>
        </Fieldset.Root>
      </form>
    </FormProvider>
  )
}
