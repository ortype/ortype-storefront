import { CheckoutContext } from '@/commercelayer/providers/checkout'
import { VStack, useStepsContext } from '@chakra-ui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useContext, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { CheckoutSummary } from '../checkout-summary'
import {
  LicenseOwnerForm,
  LicenseOwnerFormData,
  licenseOwnerSchema,
} from './license-owner-form'
import { LicenseSummary } from './license-summary'

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
  } = checkoutCtx || {}

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

  const handleProceed = async () => {
    // Bypasses form validation when projectType is not 'client'
    setIsLocalLoader(true)
    setError(null)

    try {
      if (!saveLicenseOwner) {
        setError('Save function not available')
        return
      }
      const result = await saveLicenseOwner(
        form.getValues() as any,
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
      if (!saveLicenseOwner) {
        setError('Save function not available')
        return
      }
      const result = await saveLicenseOwner(
        data as any,
        projectType === 'client'
      )

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

  if (!checkoutCtx) {
    return null
  }

  // Show checkout summary and either license summary or form
  return (
    <VStack gap={2} align="start" w="full">
      <CheckoutSummary
        heading={String(t('stepLicense.summaryHeading', 'Your details'))}
      />
      {hasLicenseOwner && licenseOwner ? (
        <LicenseSummary
          licenseOwner={licenseOwner}
          editing={editing}
          setEditing={setEditing}
          form={form}
          onSubmit={onSubmit}
          handleProceed={handleProceed}
          projectType={projectType}
          onProjectTypeChange={setProjectType}
          isLocalLoader={isLocalLoader}
          error={error}
        />
      ) : (
        <LicenseOwnerForm
          projectType={projectType}
          onProjectTypeChange={setProjectType}
          form={form}
          onSubmit={onSubmit}
          handleProceed={handleProceed}
          isLocalLoader={isLocalLoader}
          error={error}
        />
      )}
    </VStack>
  )
}
