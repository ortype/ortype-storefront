import { LicenseOwner } from '@/commercelayer/providers/checkout'
import {
  getCountryName,
  getStateName,
} from '@/commercelayer/utils/country-utils'
import {
  DrawerBackdrop,
  DrawerBody,
  DrawerCancel,
  DrawerCloseTrigger,
  DrawerConfirm,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerRoot,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
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
  // const ref = useRef<HTMLInputElement | null>(null)

  const location = [
    licenseOwner.city,
    getStateName(licenseOwner.country_code, licenseOwner.state_code),
    licenseOwner.zip_code,
  ]
    .filter(Boolean)
    .join(', ')

  const country = getCountryName(licenseOwner.country_code)

  // 'Athens, Attica, Greece'

  return (
    <VStack gap={2} mb={4} align='start'>
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
      <Box bg={'brand.50'} p={4} w='full'>
        <VStack minW={'18rem'} align='start' gap={2}>
          {licenseOwner?.company && <Text>{licenseOwner.company}</Text>}

          <Text>{licenseOwner.full_name}</Text>

          <Text>
            {licenseOwner.line_1}
            {licenseOwner.line_2 && `, ${licenseOwner.line_2}`}
          </Text>

          <Text>{location}</Text>
          <Text>{country}</Text>
          <DrawerRoot
            lazyMount
            open={editing}
            onOpenChange={(e) => setEditing(e.open)}
          >
            <DrawerTrigger asChild>
              <Button variant='text' size='sm'>
                {t('stepLicense.editButton', 'Edit address')}
              </Button>
            </DrawerTrigger>
            <DrawerBackdrop />
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>{'Edit license owner'}</DrawerTitle>
                <DrawerCloseTrigger />
              </DrawerHeader>
              <DrawerBody>
                <LicenseOwnerForm
                  projectType={projectType}
                  onProjectTypeChange={onProjectTypeChange}
                  form={form}
                  onSubmit={onSubmit}
                  handleProceed={handleProceed}
                  isLocalLoader={isLocalLoader}
                  error={error}
                  isDialog={true}
                  showProjectTypeSelection={true}
                  submitButtonText={String(
                    t('stepLicense.saveChanges', 'Save Changes')
                  )}
                  onCancel={() => setEditing(false)}
                />
              </DrawerBody>
            </DrawerContent>
          </DrawerRoot>
        </VStack>
      </Box>
      <Button
        type={'button'}
        alignSelf='flex-start'
        variant={'outline'}
        bg={'white'}
        borderRadius={'5rem'}
        size={'xs'}
        fontSize={'md'}
        _hover={{
          bg: 'black',
          color: 'white',
        }}
        onClick={() => stepsContext.setStep(3)}
      >
        {'Proceed'}
      </Button>
    </VStack>
  )
}
