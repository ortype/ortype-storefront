import { FieldsetLegend } from '@/commercelayer/components/ui/fieldset-legend'
import { useOrderContext } from '@/commercelayer/providers/Order'
import { Fieldset, Input } from '@chakra-ui/react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'

interface FormValues {
  company: string
}

interface LicenseOwner {
  is_client: boolean
  company: string
}

const MAX_NAME_LENGTH = 100

interface Props {
  label?: string
  info?: string
}
const LicenseOwnerInput: React.FC<Props> = ({ label, info }) => {
  const { isLicenseForClient, licenseOwner, setLicenseOwner } =
    useOrderContext()
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<FormValues>({
    defaultValues: {
      company: licenseOwner?.company || '',
    },
  })

  // Keep the input in sync with the provider's licenseOwner (the source of
  // truth) so the value survives hiding/showing when the radio is toggled and
  // pre-seeds the /checkout "License Owner/Company" field.
  useEffect(() => {
    setValue('company', licenseOwner?.company || '')
  }, [licenseOwner?.company, setValue])

  const submitOwner = (company: string) => {
    const nextOwner: LicenseOwner = {
      is_client: isLicenseForClient,
      company: company.trim(),
    }
    // Pure state update in the provider; persistence happens in the background
    setLicenseOwner({ licenseOwner: nextOwner })
  }

  const onSubmit = handleSubmit((data) => {
    submitOwner(data.company)
  })

  const handleBlur = handleSubmit((data) => {
    if (data.company.trim() !== (licenseOwner?.company || '')) {
      submitOwner(data.company)
    }
  })

  return (
    <form onSubmit={onSubmit}>
      <Fieldset.Root invalid={!!errors.company}>
        <FieldsetLegend info={info}>
          {label || '1. License Owner/Company*'}
        </FieldsetLegend>
        <Fieldset.Content asChild>
          <Input
            {...register('company', {
              required: 'License owner / company is required',
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
            aria-label="License owner or company name"
            variant="subtle"
            size="lg"
            fontSize={{ base: 'lg', xl: 'sm', '2xl': 'md', '3xl': 'lg' }}
            mt={1}
            borderRadius={0}
            placeholder="Enter License Owner / Company Name*"
          />
        </Fieldset.Content>
        <Fieldset.ErrorText className="sr-only" fontSize={'xs'}>
          {errors.company?.message}
        </Fieldset.ErrorText>
      </Fieldset.Root>
    </form>
  )
}

export default LicenseOwnerInput
