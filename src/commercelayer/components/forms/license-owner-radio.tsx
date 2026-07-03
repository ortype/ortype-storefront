import { FieldsetLegend } from '@/commercelayer/components/ui/fieldset-legend'
import { useOrderContext } from '@/commercelayer/providers/Order'
import { RadioCardItem, RadioCardRoot } from '@/components/ui/radio-card'
import { Fieldset, Group } from '@chakra-ui/react'
import { Controller, useForm } from 'react-hook-form'

interface FormValues {
  is_client: boolean
}

interface LicenseOwner {
  is_client: boolean
}

interface OrderMetadata {
  license?: {
    owner?: LicenseOwner
  }
}

const projectTypes = [
  {
    value: 'yourself',
    title: 'Yourself',
    description: '',
  },
  {
    value: 'client',
    title: 'Your client',
    description: '',
  },
]

interface Props {
  label?: string
  info?: string
  showProjectTypeSelection?: boolean
}

const LicenseOwnerRadio: React.FC<Props> = ({
  label,
  info,
  showProjectTypeSelection = true,
}) => {
  const { order, setLicenseOwner, isLicenseForClient } = useOrderContext()

  // const boolToString = (bool: boolean) => (bool ? 'client' : 'yourself')
  const stringToBool = (str: string) => str === 'client'

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      is_client: isLicenseForClient,
    },
  })

  const submitOwner = (is_client: boolean) => {
    const licenseOwner: LicenseOwner = {
      is_client,
    }
    // Pure state update in the provider; persistence happens in the background
    setLicenseOwner({ licenseOwner })
  }

  const onSubmit = (data: FormValues) => {
    submitOwner(data.is_client)
  }

  const handleChange = (data: FormValues) => {
    const currentVal = (order?.metadata as OrderMetadata)?.license?.owner
      ?.is_client
    if (data.is_client !== currentVal) {
      submitOwner(data.is_client)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Fieldset.Root invalid={!!errors.is_client}>
        <FieldsetLegend info={info}>
          {label || '1. The Typeface is being used in a project for*'}
        </FieldsetLegend>
        <Fieldset.Content mt={1}>
          {showProjectTypeSelection && (
            <Controller
              name="is_client"
              control={control}
              render={({ field }) => (
                <RadioCardRoot
                  value={field.value ? 'client' : 'yourself'}
                  onValueChange={(e) => {
                    const boolValue = e.value === 'client'
                    field.onChange(boolValue)
                    handleChange({ is_client: boolValue })
                  }}
                  variant={'subtle'}
                  size={'lg'}
                >
                  <Group
                    gap={1}
                    orientation={'horizontal'}
                    alignItems="stretch"
                    display="flex"
                  >
                    {projectTypes.map((type) => (
                      <RadioCardItem
                        key={type.value}
                        value={type.value}
                        isSelected={field.value === stringToBool(type.value)}
                        label={type.title}
                        description={type.description}
                        flex="1"
                        alignSelf="stretch"
                        indicatorPlacement="start"
                      />
                    ))}
                  </Group>
                </RadioCardRoot>
              )}
            />
          )}
        </Fieldset.Content>
        <Fieldset.ErrorText className="sr-only" fontSize={'xs'}>
          {errors.is_client?.message}
        </Fieldset.ErrorText>
      </Fieldset.Root>
    </form>
  )
}

export default LicenseOwnerRadio
