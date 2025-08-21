import {
  Box,
  Button,
  Fieldset,
  Group,
  Heading,
  HStack,
  Input,
  Stack,
  Switch,
  Text,
  VStack,
} from '@chakra-ui/react'

import { Radio, RadioGroup } from '@/components/ui/radio'
/*import {
  RadioCardItem,
  RadioCardLabel,
  RadioCardRoot,
} from '@/components/ui/radio-card'*/

import { AddressField } from '@/commercelayer/components/ui/address/address-field'
import { CountrySelect } from '@/commercelayer/components/ui/address/country-select'
import {
  CheckoutContext,
  LicenseOwner,
} from '@/commercelayer/providers/checkout'
import { Field } from '@/components/ui/field'
import type { Order } from '@commercelayer/sdk'
import { zodResolver } from '@hookform/resolvers/zod'
import classNames from 'classnames'
import { useContext, useEffect, useState } from 'react'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

// License owner form schema
const licenseOwnerSchema = z.object({
  company: z.string().min(1, 'Company name is required'),
  full_name: z.string().min(1, 'Full name is required'),
  line_1: z.string().min(1, 'Address is required'),
  line_2: z.string().optional().or(z.literal('')),
  city: z.string().min(1, 'City is required'),
  zip_code: z.string().min(1, 'Zip code is required'),
  country_code: z.string().min(1, 'Country is required'),
  state_code: z.string().optional().or(z.literal('')),
})

type LicenseOwnerFormData = z.infer<typeof licenseOwnerSchema>

interface Props {
  className?: string
  step: number
}

export interface ShippingToggleProps {
  forceShipping?: boolean
  disableToggle: boolean
}

export const StepLicense: React.FC<Props> = () => {
  const checkoutCtx = useContext(CheckoutContext)
  const { t } = useTranslation()

  const [isLocalLoader, setIsLocalLoader] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    saveLicenseOwner,
    licenseOwner,
    hasLicenseOwner,
    isLicenseForClient,
  } = checkoutCtx

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

  const defaultProjectType = isLicenseForClient ? 'client' : 'yourself'
  const [projectType, setProjectType] = useState(defaultProjectType)

  useEffect(() => {
    setProjectType(isLicenseForClient ? 'client' : 'yourself')
  }, [isLicenseForClient])

  // Initialize form with existing data
  const form = useForm<LicenseOwnerFormData>({
    resolver: zodResolver(licenseOwnerSchema),
    defaultValues: {
      company: licenseOwner?.company || '',
      full_name: licenseOwner?.full_name || '',
      line_1: licenseOwner?.line_1 || '',
      line_2: licenseOwner?.line_2 || '',
      city: licenseOwner?.city || '',
      zip_code: licenseOwner?.zip_code || '',
      country_code: licenseOwner?.country_code || '',
      state_code: licenseOwner?.state_code || '',
    },
  })

  const {
    handleSubmit,
    formState: { errors },
  } = form

  const onSubmit = async (data: LicenseOwnerFormData) => {
    setIsLocalLoader(true)
    setError(null)

    try {
      const result = await saveLicenseOwner(data, projectType === 'client')
      
      if (!result.success) {
        setError(result.error || 'Failed to save license owner')
        return
      }
      
      console.log('License owner saved successfully:', result.order)
    } catch (e) {
      console.log('License save error: ', e)
      setError('An unexpected error occurred')
    } finally {
      setIsLocalLoader(false)
    }
  }

  // License summary component for when license is already completed
  const LicenseSummary = () => (
    <VStack gap={4} align="start">
      <Heading size="md">
        {t('stepLicense.summaryTitle', 'License Owner Information')}
      </Heading>
      
      <Box bg="gray.50" p={4} borderRadius="md" w="full">
        <VStack align="start" gap={2}>
          <Text fontWeight="semibold">
            {isLicenseForClient 
              ? t('stepLicense.summaryClientTitle', 'License for Client')
              : t('stepLicense.summaryYourselfTitle', 'License for Yourself')
            }
          </Text>
          
          {licenseOwner?.company && (
            <Text>
              <Text as="span" fontWeight="medium">Company:</Text> {licenseOwner.company}
            </Text>
          )}
          
          <Text>
            <Text as="span" fontWeight="medium">Name:</Text> {licenseOwner.full_name}
          </Text>
          
          <Text>
            <Text as="span" fontWeight="medium">Address:</Text>{' '}
            {licenseOwner.line_1}
            {licenseOwner.line_2 && `, ${licenseOwner.line_2}`}
          </Text>
          
          <Text>
            <Text as="span" fontWeight="medium">Location:</Text>{' '}
            {licenseOwner.city}, {licenseOwner.state_code} {licenseOwner.zip_code}
          </Text>
          
          <Text>
            <Text as="span" fontWeight="medium">Country:</Text> {licenseOwner.country_code}
          </Text>
        </VStack>
      </Box>
      
      <Button variant="outline" size="sm">
        {t('stepLicense.editButton', 'Edit License Information')}
      </Button>
    </VStack>
  )

  if (!checkoutCtx) {
    return null
  }

  // Show summary if license owner is already completed
  if (hasLicenseOwner) {
    return <LicenseSummary />
  }

  return (
    <>
      <VStack gap={'4'}>
        <RadioGroup
          value={projectType}
          onValueChange={(e) => setProjectType(e.value)}
        >
          <HStack gap="6">
            {projectTypes.map((type) => (
              <Radio key={type.value} value={type.value}>
                {type.title}
              </Radio>
            ))}
          </HStack>
        </RadioGroup>
        
        <FormProvider {...form}>
          <form
            data-step="license"
            autoComplete="off"
            onSubmit={handleSubmit(onSubmit)}
          >
            <Fieldset.Root size="lg" minW="sm">
              <Fieldset.Content>
                {projectType === 'client' ? (
                  <>
                    <Controller
                      name="company"
                      render={({ field, fieldState: { error } }) => (
                        <AddressField
                          label={t(
                            'stepLicense.companyLabel',
                            'License Owner/Company*'
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
                          label={t('stepLicense.fullNameLabel', 'Full Name*')}
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
                          label={t('stepLicense.addressLabel', 'Address*')}
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
                          label={t(
                            'stepLicense.apartmentLabel',
                            'Apartment, suite, etc.'
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
                          label={t('stepLicense.cityLabel', 'City*')}
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
                          label={t('stepLicense.zipCodeLabel', 'Zip Code*')}
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
                          label={t('stepLicense.stateLabel', 'State/Province')}
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
                          label={t('stepLicense.countryLabel', 'Country*')}
                          value={field.value}
                          onChange={field.onChange}
                          error={error?.message}
                        />
                      )}
                    />
                  </>
                ) : (
                  <Text>
                    {t(
                      'stepLicense.billingAddressUsed',
                      'Billing address will be used for license owner information.'
                    )}
                  </Text>
                )}

                {/* Display save errors */}
                {error && (
                  <Box color="red.500" fontSize="sm" mt={2}>
                    {error}
                  </Box>
                )}

                {/* Display form errors */}
                {Object.keys(errors).length > 0 && (
                  <Box color="red.500" fontSize="sm" mt={2}>
                    {t(
                      'stepLicense.formErrors',
                      'Please correct the errors above.'
                    )}
                  </Box>
                )}

                <Button
                  type="submit"
                  loading={isLocalLoader}
                  disabled={isLocalLoader}
                >
                  {isLocalLoader
                    ? t('stepLicense.saving', 'Saving...')
                    : t('stepLicense.saveAndProceed', 'Save & proceed')}
                </Button>
              </Fieldset.Content>
            </Fieldset.Root>
          </form>
        </FormProvider>
      </VStack>
    </>
  )
}
