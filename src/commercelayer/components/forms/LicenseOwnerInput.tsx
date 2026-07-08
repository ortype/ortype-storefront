import { FieldsetLegend } from '@/commercelayer/components/ui/fieldset-legend'
import { useOrderContext } from '@/commercelayer/providers/Order'
import { Alert } from '@/components/ui/alert'
import { Fieldset, Input } from '@chakra-ui/react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'

interface FormValues {
  full_name: string
}

interface LicenseOwner {
  is_client: boolean
  full_name: string
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
      full_name: licenseOwner?.full_name || '',
    },
  })

  // Keep the input in sync with the provider's licenseOwner (the source of
  // truth) so the name survives hiding/showing when the radio is toggled.
  useEffect(() => {
    setValue('full_name', licenseOwner?.full_name || '')
  }, [licenseOwner?.full_name, setValue])

  const submitOwner = (fullName: string) => {
    const nextOwner: LicenseOwner = {
      is_client: isLicenseForClient,
      full_name: fullName.trim(),
    }
    // Pure state update in the provider; persistence happens in the background
    setLicenseOwner({ licenseOwner: nextOwner })
  }

  const onSubmit = handleSubmit((data) => {
    submitOwner(data.full_name)
  })

  const handleBlur = handleSubmit((data) => {
    if (data.full_name.trim() !== (licenseOwner?.full_name || '')) {
      submitOwner(data.full_name)
    }
  })

  return (
    <form onSubmit={onSubmit}>
      <Fieldset.Root invalid={!!errors.full_name}>
        <FieldsetLegend info={info}>
          {label || '1. License Owner/Company*'}
        </FieldsetLegend>
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
            fontSize={{ base: 'lg', xl: 'sm', '2xl': 'md', '3xl': 'lg' }}
            mt={1}
            borderRadius={0}
            placeholder="Enter Name of License Owner*"
          />
        </Fieldset.Content>
        {/*errors.full_name && (
          <Alert status="error" my="4">
            {errors.full_name.message}
          </Alert>
        )*/}
        <Fieldset.ErrorText className="sr-only" fontSize={'xs'}>
          {errors.full_name?.message}
        </Fieldset.ErrorText>
      </Fieldset.Root>
    </form>
  )
}

export default LicenseOwnerInput
