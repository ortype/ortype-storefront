import { FieldsetLegend } from '@/commercelayer/components/ui/fieldset-legend'
import { useOrderContext } from '@/commercelayer/providers/Order'
import { RadioCardItem, RadioCardRoot } from '@/components/ui/radio-card'
import { Fieldset, Group } from '@chakra-ui/react'

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
  // The OrderProvider is the single source of truth. Driving the selection
  // from `licenseOwner.is_client` keeps the radio and the conditional
  // LicenseOwnerInput on /buy in sync, even after async hydration.
  const { setLicenseOwner, licenseOwner } = useOrderContext()

  const isClient = licenseOwner?.is_client
  const selectedValue =
    isClient === true ? 'client' : isClient === false ? 'yourself' : undefined

  const handleValueChange = (value: string) => {
    if (!value) return
    const is_client = value === 'client'
    if (is_client === isClient) return
    // Send only is_client; the reducer merges with the existing owner so any
    // full_name already entered by the user is preserved.
    setLicenseOwner({ licenseOwner: { is_client } })
  }

  return (
    <Fieldset.Root>
      <FieldsetLegend info={info}>
        {label || '1. The Typeface is being used in a project for*'}
      </FieldsetLegend>
      <Fieldset.Content mt={1}>
        {showProjectTypeSelection && (
          <RadioCardRoot
            value={selectedValue}
            onValueChange={(e) => handleValueChange(e.value || '')}
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
                  isSelected={selectedValue === type.value}
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
      </Fieldset.Content>
    </Fieldset.Root>
  )
}

export default LicenseOwnerRadio
