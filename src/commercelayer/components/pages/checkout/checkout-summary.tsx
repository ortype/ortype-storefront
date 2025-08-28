import { CheckoutContext } from '@/commercelayer/providers/checkout'
import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Text,
  useStepsContext,
  VStack,
  Wrap,
  WrapItem,
} from '@chakra-ui/react'
import { useContext } from 'react'
import { useTranslation } from 'react-i18next'

interface CheckoutSummaryProps {
  /**
   * Show email address with edit button
   */
  showEmail?: boolean
  /**
   * Show billing address with edit button
   */
  showBillingAddress?: boolean
  /**
   * Show license owner information with edit button
   */
  showLicenseOwner?: boolean
  /**
   * Custom heading for the summary section
   */
  heading?: string
  /**
   * Additional margin bottom spacing
   */
  mb?: number
}

export const CheckoutSummary: React.FC<CheckoutSummaryProps> = ({
  showEmail = true,
  showBillingAddress = true,
  showLicenseOwner = false,
  heading,
  mb = 2,
}) => {
  const checkoutCtx = useContext(CheckoutContext)
  const stepsContext = useStepsContext()
  const { t } = useTranslation()

  if (!checkoutCtx) {
    return null
  }

  // Helper function to navigate to any step by index
  const goToStep = (stepIndex: number) => {
    // Navigate to the specified step using Chakra UI Steps context
    // Steps are 0-indexed: Email=0, Address=1, License=2, Shipping=3, Payment=4
    if (stepsContext?.setStep) {
      console.log(`Navigating to step index: ${stepIndex}`)
      stepsContext.setStep(stepIndex)
    }
  }

  // Convenience functions for specific steps
  const goToEmailStep = () => goToStep(0)
  const goToAddressStep = () => goToStep(1)
  const goToLicenseStep = () => goToStep(2)

  // Helper function to render billing address as wrapped components
  const renderBillingAddress = () => {
    if (!checkoutCtx?.billingAddress) return null

    const { line_1, line_2, city, state_code, zip_code, country_code } =
      checkoutCtx.billingAddress
    const addressParts = []

    if (line_1) addressParts.push(line_1)
    if (line_2) addressParts.push(line_2)
    if (city) addressParts.push(city)
    if (state_code) addressParts.push(state_code)
    if (zip_code) addressParts.push(zip_code)
    if (country_code) addressParts.push(country_code)

    return (
      <Wrap gap={2}>
        {addressParts.map((part, index) => (
          <WrapItem key={index}>
            <Text>{part}</Text>
          </WrapItem>
        ))}
      </Wrap>
    )
  }

  // Helper function to get license owner display value
  const getLicenseOwnerDisplayValue = () => {
    if (!checkoutCtx?.licenseOwner) return ''

    // If it's a client license, show the company name
    if (checkoutCtx.isLicenseForClient && checkoutCtx.licenseOwner.company) {
      return checkoutCtx.licenseOwner.company
    }

    // Otherwise show the full name
    return checkoutCtx.licenseOwner.full_name || ''
  }

  return (
    <VStack gap={2} align="start" w="full" mb={mb}>
      <VStack gap={2} align="start" w="full">
        <Box
          px={3}
          fontSize={'xs'}
          textTransform={'uppercase'}
          color={'#737373'}
          asChild
        >
          <Flex gap={1} alignItems={'center'}>
            {heading || t('checkoutSummary.heading', 'Checkout Summary')}
          </Flex>
        </Box>
        {/* Email Address */}
        {showEmail && checkoutCtx?.emailAddress && (
          <HStack
            justify="space-between"
            w="full"
            bg={'brand.50'}
            py={2}
            px={3}
            h={8}
          >
            <Text minW={'8rem'} fontSize={'sm'} color={'brand.500'}>
              {t('checkoutSummary.emailLabel', 'Email')}
            </Text>{' '}
            <Box flexGrow={1} pl={4}>
              {checkoutCtx.emailAddress}
            </Box>
            {/*<Button
              variant="text"
              size="xs"
              onClick={goToEmailStep}
              fontSize="xs"
              px={2}
              py={1}
              h="auto"
              minH="auto"
            >
              {t('checkoutSummary.editButton', 'edit')}
            </Button>*/}
          </HStack>
        )}

        {/* Billing Address */}
        {showBillingAddress && checkoutCtx?.billingAddress && (
          <HStack
            justify="space-between"
            w="full"
            bg={'brand.50'}
            py={1}
            px={3}
          >
            <Text minW={'8rem'} fontSize={'sm'} color={'brand.500'}>
              {t('checkoutSummary.billingAddressLabel', 'Billing Address')}
            </Text>
            <Box flexGrow={1} pl={4}>
              {renderBillingAddress()}
            </Box>
            <Button
              variant="text"
              size="xs"
              onClick={goToAddressStep}
              fontSize="xs"
              px={2}
              py={1}
              h="auto"
              minH="auto"
            >
              {t('checkoutSummary.editButton', 'edit')}
            </Button>
          </HStack>
        )}

        {/* License Owner */}
        {showLicenseOwner && checkoutCtx?.hasLicenseOwner && (
          <HStack
            justify="space-between"
            w="full"
            bg={'brand.50'}
            py={1}
            px={3}
          >
            <Text minW={'8rem'} fontSize={'sm'} color={'brand.500'}>
              {t('checkoutSummary.licenseOwnerLabel', 'License Owner')}
            </Text>{' '}
            <Box flexGrow={1} pl={4}>
              {getLicenseOwnerDisplayValue()}
            </Box>
            <Button
              variant="text"
              size="xs"
              onClick={goToLicenseStep}
              fontSize="xs"
              px={2}
              py={1}
              h="auto"
              minH="auto"
            >
              {t('checkoutSummary.editButton', 'edit')}
            </Button>
          </HStack>
        )}
      </VStack>
    </VStack>
  )
}
