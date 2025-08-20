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

  const {
    orderId,
    order,
    updateOrder,
    setLicenseOwner,
    billingAddress,
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
      company: order?.metadata?.license?.owner?.company || '',
      full_name: order?.metadata?.license?.owner?.full_name || '',
      line_1: order?.metadata?.license?.owner?.line_1 || '',
      line_2: order?.metadata?.license?.owner?.line_2 || '',
      city: order?.metadata?.license?.owner?.city || '',
      zip_code: order?.metadata?.license?.owner?.zip_code || '',
      country_code: order?.metadata?.license?.owner?.country_code || '',
      state_code: order?.metadata?.license?.owner?.state_code || '',
    },
  })

  const {
    handleSubmit,
    formState: { errors },
  } = form

  const onSubmit = async (data: LicenseOwnerFormData) => {
    setIsLocalLoader(true)

    const owner: LicenseOwner =
      projectType === 'client'
        ? {
            is_client: true,
            ...data,
          }
        : {
            is_client: false,
            company: billingAddress.company,
            full_name: billingAddress.full_name,
            line_1: billingAddress.line_1,
            line_2: billingAddress.line_2,
            city: billingAddress.city,
            zip_code: billingAddress.zip_code,
            state_code: billingAddress.state_code,
            country_code: billingAddress.country_code,
          }

    console.log('Submit license: ', { owner })

    try {
      const { order: updatedOrder } = await updateOrder({
        id: orderId,
        attributes: {
          metadata: {
            license: {
              ...order.metadata?.license,
              owner,
            },
          },
        },
        // there is an `include` param
      })
      console.log('Submit license: ', { updatedOrder })

      setLicenseOwner({
        order: updatedOrder,
        licenseOwner: updatedOrder?.metadata?.license?.owner,
      })
    } catch (e) {
      console.log('License updateOrder error: ', e)
    } finally {
      setIsLocalLoader(false)
    }
  }

  if (!checkoutCtx) {
    return null
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
        {/*
            // @NOTE: cool, but no clear path for usuage as a controlled component in the docs
            <RadioCardRoot defaultValue={defaultProjectType} gap="4" maxW="sm">
              <RadioCardLabel>
                The typeface is being used in a project for
              </RadioCardLabel>
              <Group attached orientation="horizontal">
                {projectTypes.map((type) => (
                  <RadioCardItem
                    onChange={(e) =>
                      e.target.value && setProjectType(e.target.value)
                    }
                    width="full"
                    indicatorPlacement="start"
                    label={type.title}
                    description={type.description}
                    key={type.value}
                    value={type.value}
                  />
                ))}
              </Group>
            </RadioCardRoot>*/}
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
