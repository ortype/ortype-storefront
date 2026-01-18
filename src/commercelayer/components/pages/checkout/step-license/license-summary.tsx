import { LicenseOwner } from '@/commercelayer/providers/checkout'
import {
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Box,
  Button,
  Flex,
  Text,
  useStepsContext,
  VStack,
} from '@chakra-ui/react'
import { UseFormReturn } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { LicenseOwnerForm, LicenseOwnerFormData } from './license-owner-form'

interface LicenseSummaryProps {
  licenseOwner: LicenseOwner
  editing: boolean
  setEditing: (editing: boolean) => void
  form: UseFormReturn<LicenseOwnerFormData>
  onSubmit: (data: LicenseOwnerFormData) => Promise<void>
  handleProceed: () => Promise<void>
  projectType: string
  onProjectTypeChange: (value: string) => void
  isLocalLoader: boolean
  error: string | null
}

export const LicenseSummary: React.FC<LicenseSummaryProps> = ({
  licenseOwner,
  editing,
  setEditing,
  form,
  onSubmit,
  handleProceed,
  projectType,
  onProjectTypeChange,
  isLocalLoader,
  error,
}) => {
  const { t } = useTranslation()
  const stepsContext = useStepsContext()

  return (
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
            <DialogContent borderRadius={'2rem'}>
              <DialogHeader>
                <DialogTitle
                  textAlign={'center'}
                  fontSize={'2rem'}
                  fontWeight={'normal'}
                  textTransform={'uppercase'}
                  mx={'auto'}
                  pb={4}
                >
                  {'Edit license owner'}
                </DialogTitle>
              </DialogHeader>
              <DialogBody>
                <LicenseOwnerForm
                  projectType={projectType}
                  onProjectTypeChange={onProjectTypeChange}
                  form={form}
                  onSubmit={onSubmit}
                  handleProceed={handleProceed}
                  isLocalLoader={isLocalLoader}
                  error={error}
                  isDialog={true}
                  showProjectTypeSelection={false}
                  submitButtonText={String(
                    t('stepLicense.saveChanges', 'Save Changes')
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
}
