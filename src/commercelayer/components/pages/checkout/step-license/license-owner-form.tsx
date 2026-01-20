import { LicenseSizeNativeSelect } from '@/commercelayer/components/forms/LicenseSizeNativeSelect'
import { AddressField } from '@/commercelayer/components/ui/address/address-field'
import { CountrySelect } from '@/commercelayer/components/ui/address/country-select'
import { useOrderContext } from '@/commercelayer/providers/Order'
import { RadioCardItem, RadioCardRoot } from '@/components/ui/radio-card'
import {
  Box,
  Button,
  Group,
  HStack,
  RadioCard,
  Text,
  VStack,
} from '@chakra-ui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Controller,
  FormProvider,
  useForm,
  UseFormReturn,
} from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

// License owner form schema
export const licenseOwnerSchema = z.object({
  company: z.string().min(1, 'Company name is required'),
  full_name: z.string().min(1, 'Full name is required'),
  line_1: z.string().min(1, 'Address is required'),
  line_2: z.string().optional().or(z.literal('')),
  city: z.string().min(1, 'City is required'),
  zip_code: z.string().min(1, 'Zip code is required'),
  country_code: z.string().min(1, 'Country is required'),
  state_code: z.string().optional().or(z.literal('')),
})

export type LicenseOwnerFormData = z.infer<typeof licenseOwnerSchema>

const projectTypes = [
  {
    value: 'yourself',
    title: 'Yourself',
    description: 'You will own the license',
  },
  {
    value: 'client',
    title: 'Your client',
    description: 'Your client will own the license',
  },
]

interface LicenseOwnerFormProps {
  projectType: string
  onProjectTypeChange: (value: string) => void
  form: UseFormReturn<LicenseOwnerFormData>
  onSubmit: (data: LicenseOwnerFormData) => Promise<void>
  handleProceed: () => Promise<void>
  isLocalLoader: boolean
  error: string | null
  showProjectTypeSelection?: boolean
  showSubmitButton?: boolean
  submitButtonText?: string
  onCancel?: () => void
  isDialog?: boolean
}

export const LicenseOwnerForm: React.FC<LicenseOwnerFormProps> = ({
  projectType,
  onProjectTypeChange,
  form,
  onSubmit,
  handleProceed,
  isLocalLoader,
  error,
  showProjectTypeSelection = true,
  showSubmitButton = true,
  submitButtonText,
  onCancel,
  isDialog,
}) => {
  const { t } = useTranslation()
  const {
    handleSubmit,
    formState: { errors },
  } = form

  // Access OrderProvider for license size
  const { licenseSize, setLicenseSize } = useOrderContext()

  return (
    <VStack gap={1} alignItems={'stretch'}>
      {showProjectTypeSelection && (
        <RadioCardRoot
          value={projectType}
          onValueChange={(e) => onProjectTypeChange(e.value || '')}
          variant={'subtle'}
          size={'lg'}
        >
          <RadioCard.Label
            px={3}
            fontSize={'xs'}
            textTransform={'uppercase'}
            fontVariantNumeric={'tabular-nums'}
            color={'#737373'}
          >
            The Typeface is being used in a project for
          </RadioCard.Label>

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
                label={type.title}
                description={type.description}
                flex="1"
                alignSelf="stretch"
                indicatorPlacement="end"
              />
            ))}
          </Group>
        </RadioCardRoot>
      )}

      <FormProvider {...form}>
        <Box as="form" w="full" onSubmit={handleSubmit(onSubmit)}>
          <VStack gap={1} alignItems={'flex-start'}>
            {projectType === 'client' || isDialog ? (
              <>
                {isDialog && (
                  <Text
                    fontSize={'xs'}
                    textTransform={'uppercase'}
                    fontVariantNumeric={'tabular-nums'}
                    color={'#737373'}
                  >
                    {'Your client'}
                  </Text>
                )}
                <Controller
                  name="company"
                  render={({ field, fieldState: { error } }) => (
                    <AddressField
                      label={String(
                        t('stepLicense.companyLabel', 'License Owner/Company*')
                      )}
                      type="text"
                      value={field.value}
                      onChange={field.onChange}
                      error={error?.message}
                    />
                  )}
                />

                <Controller
                  name="full_name"
                  render={({ field, fieldState: { error } }) => (
                    <AddressField
                      label={String(
                        t('stepLicense.fullNameLabel', 'Full Name*')
                      )}
                      type="text"
                      value={field.value}
                      onChange={field.onChange}
                      error={error?.message}
                    />
                  )}
                />

                <Controller
                  name="line_1"
                  render={({ field, fieldState: { error } }) => (
                    <AddressField
                      label={String(t('stepLicense.addressLabel', 'Address*'))}
                      type="text"
                      value={field.value}
                      onChange={field.onChange}
                      error={error?.message}
                    />
                  )}
                />

                <Controller
                  name="line_2"
                  render={({ field, fieldState: { error } }) => (
                    <AddressField
                      label={String(
                        t(
                          'stepLicense.apartmentLabel',
                          'Apartment, suite, etc.'
                        )
                      )}
                      type="text"
                      value={field.value || ''}
                      onChange={field.onChange}
                      error={error?.message}
                    />
                  )}
                />

                <Controller
                  name="city"
                  render={({ field, fieldState: { error } }) => (
                    <AddressField
                      label={String(t('stepLicense.cityLabel', 'City*'))}
                      type="text"
                      value={field.value}
                      onChange={field.onChange}
                      error={error?.message}
                    />
                  )}
                />

                <Controller
                  name="zip_code"
                  render={({ field, fieldState: { error } }) => (
                    <AddressField
                      label={String(t('stepLicense.zipCodeLabel', 'Zip Code*'))}
                      type="text"
                      value={field.value}
                      onChange={field.onChange}
                      error={error?.message}
                    />
                  )}
                />

                <Controller
                  name="state_code"
                  render={({ field, fieldState: { error } }) => (
                    <AddressField
                      label={String(
                        t('stepLicense.stateLabel', 'State/Province')
                      )}
                      type="text"
                      value={field.value || ''}
                      onChange={field.onChange}
                      error={error?.message}
                    />
                  )}
                />

                <Controller
                  name="country_code"
                  render={({ field, fieldState: { error } }) => (
                    <CountrySelect
                      label={String(t('stepLicense.countryLabel', 'Country*'))}
                      value={field.value}
                      onChange={field.onChange}
                      error={error?.message}
                    />
                  )}
                />
              </>
            ) : (
              <>
                <Box bg={'brand.50'} p={4} w="full" px={3}>
                  <Text>
                    {t(
                      'stepLicense.billingAddressUsed',
                      'Your address will be used for license owner information.'
                    )}
                  </Text>
                </Box>
                <LicenseSizeNativeSelect
                  setLicenseSize={setLicenseSize}
                  licenseSize={licenseSize}
                  label={'Your company size'}
                />
              </>
            )}

            {/* Display save errors */}
            {error && (
              <Box color="red.500" fontSize="sm" w="full" textAlign="left">
                {error}
              </Box>
            )}

            {/* Display form errors */}
            {Object.keys(errors).length > 0 && (
              <Box color="red.500" fontSize="sm" w="full" textAlign="left">
                {t(
                  'stepLicense.formErrors',
                  'Please correct the errors above.'
                )}
              </Box>
            )}

            {showSubmitButton && (
              <HStack
                mt={4}
                gap={3}
                w="full"
                justify={onCancel ? 'flex-end' : 'flex-start'}
              >
                {onCancel && (
                  <Button
                    variant={'outline'}
                    bg={'white'}
                    borderRadius={'5rem'}
                    size={'sm'}
                    fontSize={'md'}
                    onClick={onCancel}
                    disabled={isLocalLoader}
                  >
                    {t('common.cancel', 'Cancel')}
                  </Button>
                )}
                <Button
                  type={projectType === 'client' ? 'submit' : 'button'}
                  onClick={
                    projectType === 'client'
                      ? handleSubmit(onSubmit)
                      : handleProceed
                  }
                  loading={isLocalLoader}
                  disabled={isLocalLoader}
                  variant={'outline'}
                  bg={'white'}
                  borderRadius={'5rem'}
                  size={'sm'}
                  fontSize={'md'}
                >
                  {isLocalLoader
                    ? t('stepLicense.saving', 'Saving...')
                    : submitButtonText ||
                      t('stepLicense.saveAndProceed', 'Save & proceed')}
                </Button>
              </HStack>
            )}
          </VStack>
        </Box>
      </FormProvider>
    </VStack>
  )
}
