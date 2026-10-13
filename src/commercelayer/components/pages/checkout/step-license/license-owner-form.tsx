// import { LicenseSizeNativeSelect } from '@/commercelayer/components/forms/LicenseSizeNativeSelect'
import { AddressField } from '@/commercelayer/components/ui/address/address-field'
import { CountrySelect } from '@/commercelayer/components/ui/address/country-select'
import { useOrderContext } from '@/commercelayer/providers/order'
import { Alert } from '@/components/ui/alert'
import { RadioCardItem, RadioCardRoot } from '@/components/ui/radio-card'
import {
  Box,
  Button,
  Grid,
  Group,
  HStack,
  RadioCard,
  Text,
  VStack,
} from '@chakra-ui/react'
import { Controller, FormProvider, UseFormReturn } from 'react-hook-form'
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
    description: '',
  },
  {
    value: 'client',
    title: 'Your client',
    description: '',
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
    <VStack gap={1} alignItems={'stretch'} w={'full'}>
      {showProjectTypeSelection && (
        <RadioCardRoot
          value={projectType}
          onValueChange={(e) => onProjectTypeChange(e.value || '')}
          variant={isDialog ? 'outline' : 'subtle'}
          size={'lg'}
        >
          <RadioCard.Label
            px={3}
            fontSize={'xs'}
            lineHeight={1.2}
            textTransform={'uppercase'}
            color={'#737373'}
          >
            The Typeface is being used in a project for
          </RadioCard.Label>

          <Group
            gap={1}
            orientation={'horizontal'}
            alignItems='stretch'
            display='flex'
          >
            {projectTypes.map((type) => (
              <RadioCardItem
                key={type.value}
                value={type.value}
                isSelected={projectType === type.value}
                label={type.title}
                description={type.description}
                flex='1'
                alignSelf='stretch'
                indicatorPlacement='start'
                /*bg={isDialog ? 'colorPalette.bg' : 'brand.50'}
                _hover={{
                  bg: '#e3e3e3',
                  _checked: {
                    bg: '#e3e3e3',
                  },
                }}*/
              />
            ))}
          </Group>
        </RadioCardRoot>
      )}

      <FormProvider {...form}>
        <Box as='form' w='full' onSubmit={handleSubmit(onSubmit)}>
          <VStack gap={1} alignItems={'flex-start'} w={'full'}>
            {projectType === 'client' ? (
              <>
                {isDialog && (
                  <Text
                    fontSize={'xs'}
                    textTransform={'uppercase'}
                    color={'#737373'}
                    pl={3}
                  >
                    {'Your client'}
                  </Text>
                )}
                <Controller
                  name='company'
                  render={({ field, fieldState: { error } }) => (
                    <AddressField
                      label={String(
                        t(
                          'stepLicense.companyLabel',
                          'License Owner/Company*'
                        )
                      )}
                      type='text'
                      variant={isDialog ? 'white' : 'subtle'}
                      value={field.value}
                      onChange={field.onChange}
                      error={error?.message}
                    />
                  )}
                />

                <Controller
                  name='full_name'
                  render={({ field, fieldState: { error } }) => (
                    <AddressField
                      label={String(
                        t('stepLicense.fullNameLabel', 'Full Name*')
                      )}
                      type='text'
                      variant={isDialog ? 'white' : 'subtle'}
                      value={field.value}
                      onChange={field.onChange}
                      error={error?.message}
                    />
                  )}
                />

                <Controller
                  name='line_1'
                  render={({ field, fieldState: { error } }) => (
                    <AddressField
                      label={String(
                        t('stepLicense.addressLabel', 'Address*')
                      )}
                      type='text'
                      variant={isDialog ? 'white' : 'subtle'}
                      value={field.value}
                      onChange={field.onChange}
                      error={error?.message}
                    />
                  )}
                />

                <Controller
                  name='line_2'
                  render={({ field, fieldState: { error } }) => (
                    <AddressField
                      label={String(
                        t(
                          'stepLicense.apartmentLabel',
                          'Apartment, suite, etc.'
                        )
                      )}
                      type='text'
                      variant={isDialog ? 'white' : 'subtle'}
                      value={field.value || ''}
                      onChange={field.onChange}
                      error={error?.message}
                    />
                  )}
                />

                <Grid templateColumns='repeat(2, 1fr)' gap={1} w={'full'}>
                  <Controller
                    name='city'
                    render={({ field, fieldState: { error } }) => (
                      <AddressField
                        label={String(t('stepLicense.cityLabel', 'City*'))}
                        type='text'
                        variant={isDialog ? 'white' : 'subtle'}
                        value={field.value}
                        onChange={field.onChange}
                        error={error?.message}
                      />
                    )}
                  />

                  <Controller
                    name='zip_code'
                    render={({ field, fieldState: { error } }) => (
                      <AddressField
                        label={String(
                          t('stepLicense.zipCodeLabel', 'Zip Code*')
                        )}
                        type='text'
                        variant={isDialog ? 'white' : 'subtle'}
                        value={field.value}
                        onChange={field.onChange}
                        error={error?.message}
                      />
                    )}
                  />

                  <Controller
                    name='state_code'
                    render={({ field, fieldState: { error } }) => (
                      <AddressField
                        label={String(
                          t('stepLicense.stateLabel', 'State/Province')
                        )}
                        type='text'
                        variant={isDialog ? 'white' : 'subtle'}
                        value={field.value || ''}
                        onChange={field.onChange}
                        error={error?.message}
                      />
                    )}
                  />

                  <Controller
                    name='country_code'
                    render={({ field, fieldState: { error } }) => (
                      <CountrySelect
                        label={String(
                          t('stepLicense.countryLabel', 'Country*')
                        )}
                        value={field.value}
                        onChange={field.onChange}
                        error={error?.message}
                        variant={isDialog ? 'white' : 'subtle'}
                      />
                    )}
                  />
                </Grid>
                {/* @TODO: Re-enable license size changes during checkout.
                    Changing size after commit requires repricing the line
                    items: update the order's licenseSize, then call
                    repriceAll() (OrderProvider) to recommit each font at the
                    new size. Until then, show the current size as read-only. */}
                <Text
                  fontSize={'xs'}
                  textTransform={'uppercase'}
                  color={'#737373'}
                  mt={1}
                  pl={3}
                >
                  {'Your clients company size'}
                </Text>
                <Box
                  bg={isDialog ? 'colorPalette.bg' : 'brand.50'}
                  w='full'
                  px={3}
                  py={3}
                >
                  <Text fontSize={'md'} lineHeight={1.2}>
                    {licenseSize?.label}
                  </Text>
                </Box>
              </>
            ) : (
              <>
                <Box
                  bg={isDialog ? 'colorPalette.bg' : 'brand.50'}
                  p={4}
                  w='full'
                  px={3}
                >
                  <Text>
                    {t(
                      'stepLicense.billingAddressUsed',
                      'Your billing address will be used for license owner information.'
                    )}
                  </Text>
                </Box>
                {/* @TODO: Re-enable license size changes during checkout (see above) 
                <LicenseSizeNativeSelect
                  setLicenseSize={setLicenseSize}
                  licenseSize={licenseSize}
                  label={'Your company size'}
                />
                */}
                <Text
                  fontSize={'xs'}
                  lineHeight={1}
                  textTransform={'uppercase'}
                  color={'#737373'}
                  mt={1}
                  pl={3}
                >
                  {'Your company size'}
                </Text>
                <Box
                  bg={isDialog ? 'colorPalette.bg' : 'brand.50'}
                  w='full'
                  px={3}
                  py={3}
                >
                  <Text fontSize={'md'} lineHeight={1.2}>
                    {licenseSize?.label}
                  </Text>
                </Box>
              </>
            )}

            {/* Display save errors */}
            {error && (
              <Alert status='error' my='4'>
                {error}
              </Alert>
            )}

            {/* Display form errors */}
            {Object.keys(errors).length > 0 && (
              <Box color='red.500' fontSize='sm' w='full' textAlign='left'>
                {t(
                  'stepLicense.formErrors',
                  'Please correct the errors above.'
                )}
              </Box>
            )}

            {showSubmitButton && (
              <HStack mt={2} gap={2} w='full' justify={'flex-end'}>
                {onCancel && (
                  <Button
                    variant='text'
                    size='xs'
                    fontSize='xs'
                    px={2}
                    py={1}
                    h='auto'
                    minH='auto'
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
                  alignSelf='flex-end'
                  variant={'solid'}
                  bg={'black'}
                  color={'white'}
                  borderRadius={'5rem'}
                  border={'2px solid #000'}
                  size={'sm'}
                  fontSize={'md'}
                  gap={1}
                  _hover={{
                    bg: 'transparent',
                    color: 'colorPalette.fg',
                  }}
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
