import { useOrderContext } from '@/commercelayer/providers/Order'
import { FieldsetLegend } from '@/components/composite/Buy'
import { toaster } from '@/components/ui/toaster'
import { Fieldset, Input } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

interface FormValues {
  full_name: string
}

interface LicenseOwner {
  is_client: boolean
  full_name: string
}

interface OrderMetadata {
  license?: {
    owner?: LicenseOwner
  }
}

const MAX_NAME_LENGTH = 100

const LicenseOwnerInput = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { order, setLicenseOwner } = useOrderContext()
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<FormValues>({
    defaultValues: {
      full_name: order?.metadata?.license?.owner?.full_name || '',
    },
  })

  // Keep form in sync with order changes
  useEffect(() => {
    const ownerName = (order?.metadata as OrderMetadata)?.license?.owner
      ?.full_name
    // Always sync with order metadata, even if empty
    setValue('full_name', ownerName || '')
  }, [order?.metadata, setValue])

  const onSubmit = handleSubmit(async (data) => {
    setIsSubmitting(true)
    try {
      const licenseOwner: LicenseOwner = {
        is_client: false,
        full_name: data.full_name.trim(),
      }
      await setLicenseOwner({ licenseOwner })
      toaster.create({
        title: 'License owner updated successfully',
        type: 'success',
        duration: 2000,
      })
    } catch (error) {
      console.error('Failed to update license owner:', error)
      toaster.create({
        title: 'Failed to update license owner. Please try again.',
        description: error,
        type: 'error',
        duration: '2000',
      })
    } finally {
      setIsSubmitting(false)
    }
  })

  const handleBlur = handleSubmit(async (data) => {
    const currentName = (order?.metadata as OrderMetadata)?.license?.owner
      ?.full_name
    if (data.full_name.trim() !== currentName) {
      await onSubmit()
    }
  })

  return (
    <form onSubmit={onSubmit}>
      <Fieldset.Root invalid={!!errors.full_name}>
        <FieldsetLegend>{'1. License Owner/Company*'}</FieldsetLegend>
        <Fieldset.Content asChild>
          <Input
            {...register('full_name', {
              required: 'License owner name is required',
              minLength: {
                value: 2,
                message: 'Name must be at least 2 characters',
              },
              maxLength: {
                value: MAX_NAME_LENGTH,
                message: `Name cannot exceed ${MAX_NAME_LENGTH} characters`,
              },
              validate: {
                notOnlySpaces: (value) =>
                  value.trim().length > 0 || 'Name cannot be only spaces',
              },
            })}
            onBlur={handleBlur}
            aria-label="License owner name"
            variant="subtle"
            size="lg"
            fontSize={'lg'}
            mt={1}
            borderRadius={0}
            disabled={isSubmitting}
            placeholder="Enter license owner or company name"
          />
        </Fieldset.Content>
        <Fieldset.ErrorText>{errors.full_name?.message}</Fieldset.ErrorText>
      </Fieldset.Root>
    </form>
  )
}

export default LicenseOwnerInput
