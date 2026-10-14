import { LicenseOwner } from '@/commercelayer/providers/checkout'
import {
  getCountryName,
  getStateName,
} from '@/commercelayer/utils/country-utils'
import { CloseButton } from '@/components/ui/close-button'
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Box,
  Button,
  Drawer,
  Flex,
  Portal,
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
          <Drawer.Root
            lazyMount
            open={editing}
            onOpenChange={(e) => setEditing(e.open)}
            size={'md'}
            // initialFocusEl={() => ref.current}
          >
            <Drawer.Trigger asChild>
              <Button variant='text' size='sm'>
                {t('stepLicense.editButton', 'Edit address')}
              </Button>
            </Drawer.Trigger>
            <Portal>
              <Drawer.Backdrop css={{ backdropFilter: 'blur(5px)' }} />
              <Drawer.Positioner
              // p={10}
              >
                <Drawer.Content
                  rounded={0}
                  // rounded={40}
                  p={4}
                  bg={'#e7e7e7'}
                >
                  <Drawer.CloseTrigger
                    position={'absolute'}
                    top={'1rem'}
                    left={'-4rem'}
                    asChild
                  >
                    <CloseButton size='2xl' />
                  </Drawer.CloseTrigger>
                  <Drawer.Header pt={2} pb={3}>
                    <Drawer.Title
                      fontSize={'2rem'}
                      fontWeight={'normal'}
                      textTransform={'uppercase'}
                      lineHeight={1}
                      pb={3}
                      borderBottom={'1px solid #919191'}
                    >
                      {'Edit license owner'}
                    </Drawer.Title>
                  </Drawer.Header>
                  <Drawer.Body>
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
                  </Drawer.Body>
                </Drawer.Content>
              </Drawer.Positioner>
            </Portal>
          </Drawer.Root>
          {/*
          <DialogRoot
            lazyMount
            open={editing}
            onOpenChange={(e) => setEditing(e.open)}
            size={'full'}
            motionPreset={'slide-in-bottom-custom'}
          >
            <DialogTrigger asChild>
              <Button variant='text' size='sm'>
                {t('stepLicense.editButton', 'Edit address')}
              </Button>
            </DialogTrigger>
            <DialogContent
              backdrop
              blurred
              borderRadius={0}
              bg={'transparent'}
              h={'100vh'}
            >
              <DialogBody>
                <DialogTitle
                  textAlign={'center'}
                  fontSize={'2rem'}
                  fontWeight={'normal'}
                  textTransform={'uppercase'}

                  pb={8}
                  my={4}
                  lineHeight={1}
                >
                  {'Edit license owner'}
                </DialogTitle>
                <Container maxW={'30rem'}>
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
                </Container>
              </DialogBody>
              <Box position={'absolute'} top={3} left={3}>
                <DialogCloseTrigger
                  position={'relative'}
                  top={'auto'}
                  right={'auto'}
                >
                  <CloseButton size='2xl' />
                </DialogCloseTrigger>
              </Box>
            </DialogContent>
          </DialogRoot>*/}
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
