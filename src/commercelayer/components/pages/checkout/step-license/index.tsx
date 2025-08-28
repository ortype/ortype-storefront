import {
  DialogActionTrigger,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Radio, RadioGroup } from '@/components/ui/radio'
import {
  Box,
  Button,
  Fieldset,
  Flex,
  Group,
  Heading,
  HStack,
  Input,
  SimpleGrid,
  Stack,
  Switch,
  Text,
  useStepsContext,
  VStack,
  Wrap,
  WrapItem,
} from '@chakra-ui/react'
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
import { CheckoutSummary } from '../checkout-summary'

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

export const StepLicense: React.FC<Props> = () => {
  const checkoutCtx = useContext(CheckoutContext)
  const { t } = useTranslation()

  const stepsContext = useStepsContext()
  const [isLocalLoader, setIsLocalLoader] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)

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

  const handleProceed = async () => {
    // Bypasses form validation when projectType is not 'client'
    setIsLocalLoader(true)
    setError(null)

    try {
      const result = await saveLicenseOwner(
        form.getValues(),
        projectType === 'client'
      )

      if (!result.success) {
        setError(result.error || 'Failed to save license owner')
        return
      }

      if (editing) {
        setEditing(false)
      }
    } catch (e) {
      setError('An unexpected error occurred')
    } finally {
      setIsLocalLoader(false)
    }
  }

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
      // Close dialog if editing
      if (editing) {
        setEditing(false)
      }
    } catch (e) {
      console.log('License save error: ', e)
      setError('An unexpected error occurred')
    } finally {
      setIsLocalLoader(false)
    }
  }

  // Extracted form component for DRY reuse
  interface LicenseOwnerFormProps {
    showProjectTypeSelection?: boolean
    showSubmitButton?: boolean
    submitButtonText?: string
    onCancel?: () => void
  }

  const LicenseOwnerForm: React.FC<LicenseOwnerFormProps> = ({
    showProjectTypeSelection = true,
    showSubmitButton = true,
    submitButtonText,
    onCancel,
    isDialog,
  }) => (
    <VStack gap={4}>
      {showProjectTypeSelection && (
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
      )}

      <FormProvider {...form}>
        <Box as="form" w="full" onSubmit={handleSubmit(onSubmit)}>
          <VStack gap={4}>
            {projectType === 'client' || isDialog ? (
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
                gap={3}
                w="full"
                justify={onCancel ? 'flex-end' : 'stretch'}
              >
                {onCancel && (
                  <Button
                    variant="outline"
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
                  flex={onCancel ? 'none' : '1'}
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

  const LicenseSummary = () => (
    <VStack gap={2} mb={4} align="start">
      <Box
        px={3}
        fontSize={'xs'}
        textTransform={'uppercase'}
        color={'#737373'}
        asChild
      >
        <Flex gap={1} alignItems={'center'}>
          {t('stepLicense.summaryTitle', 'License Owner')}
        </Flex>
      </Box>
      <Box bg={'brand.50'} p={4} w="full">
        <VStack align="start" gap={2}>
          {/*<Text>
            {isLicenseForClient
              ? t('stepLicense.summaryClientTitle', 'License for Client')
              : t('stepLicense.summaryYourselfTitle', 'License for Yourself')}
          </Text>*/}

          {licenseOwner?.company && <Text>{licenseOwner.company}</Text>}

          <Text>{licenseOwner.full_name}</Text>

          <Text>
            {licenseOwner.line_1}
            {licenseOwner.line_2 && `, ${licenseOwner.line_2}`}
          </Text>

          <Text>
            {licenseOwner.city}, {licenseOwner.state_code}{' '}
            {licenseOwner.zip_code}
          </Text>

          <Text>{licenseOwner.country_code}</Text>
          <DialogRoot
            lazyMount
            open={editing}
            onOpenChange={(e) => setEditing(e.open)}
          >
            <DialogTrigger asChild>
              <Button variant="text" size="sm">
                {t('stepLicense.editButton', 'Edit address')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{'Edit license owner'}</DialogTitle>
              </DialogHeader>
              <DialogBody>
                <LicenseOwnerForm
                  isDialog={true}
                  showProjectTypeSelection={false}
                  submitButtonText={t(
                    'stepLicense.saveChanges',
                    'Save Changes'
                  )}
                  onCancel={() => setEditing(false)}
                />
              </DialogBody>
            </DialogContent>
          </DialogRoot>
        </VStack>
      </Box>
      <Button
        type={'button'}
        variant={'outline'}
        bg={'white'}
        borderRadius={'5rem'}
        size={'sm'}
        fontSize={'md'}
        onClick={() => stepsContext.setStep(3)}
      >
        {'Proceed'}
      </Button>
    </VStack>
  )

  if (!checkoutCtx) {
    return null
  }

  // Show checkout summary and either license summary or form
  return (
    <VStack gap={2} align="start" w="full">
      <CheckoutSummary
        heading={t('stepLicense.summaryHeading', 'Your details')}
      />
      {hasLicenseOwner ? <LicenseSummary /> : <LicenseOwnerForm />}
    </VStack>
  )
}
