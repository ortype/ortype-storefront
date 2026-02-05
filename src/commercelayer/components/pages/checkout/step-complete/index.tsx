import { CheckoutContext } from '@/commercelayer/providers/checkout'
import { CustomAddress } from '@/components/ui/CustomerAddressCard'
import { useRouter } from 'next/navigation'
import { useContext } from 'react'
import { Trans, useTranslation } from 'react-i18next'
// @TODO: this utililty is duplicated at `src/utils/payments`
import { getTranslations } from '@/components/utils/payments'
import {
  Box,
  Button,
  Flex,
  HStack,
  Text,
  VStack,
  Wrap,
  WrapItem,
} from '@chakra-ui/react'

// Import our own payment source components
import {
  PaymentSource,
  PaymentSourceBrandIcon,
  PaymentSourceBrandName,
  PaymentSourceDetail,
} from '@/commercelayer/components/payment'

interface Props {
  orderNumber: string
}

export const StepComplete: React.FC<Props> = ({ orderNumber }) => {
  const { t } = useTranslation()

  const ctx = useContext(CheckoutContext)

  const router = useRouter()

  if (!ctx) return null

  const handleClick = () => {
    // ctx?.returnUrl && (document.location.href = ctx?.returnUrl)
    router.push(`/`)
  }

  // Helper function to render billing address as wrapped components
  const renderBillingAddress = () => {
    if (!ctx?.billingAddress) return null

    const {
      first_name,
      last_name,
      line_1,
      line_2,
      city,
      state_code,
      zip_code,
      country_code,
      phone,
    } = ctx.billingAddress
    const addressParts = []

    // if (first_name) addressParts.push(first_name)
    // if (last_name) addressParts.push(last_name)
    if (line_1) addressParts.push(line_1)
    if (line_2) addressParts.push(line_2)
    if (city) addressParts.push(city)
    if (state_code) addressParts.push(state_code)
    if (zip_code) addressParts.push(zip_code)
    if (country_code) addressParts.push(country_code)
    if (phone) addressParts.push(phone)

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
    if (!ctx?.licenseOwner) return ''

    // If it's a client license, show the company name
    if (ctx.isLicenseForClient && ctx.licenseOwner.company) {
      return ctx.licenseOwner.company
    }

    // Otherwise show the full name
    return ctx.licenseOwner.full_name || ''
  }

  return (
    <VStack gap={2} align="start" w="full">
      {/*<Heading
        textAlign={'center'}
        fontSize={'2rem'}
        fontWeight={'normal'}
        textTransform={'uppercase'}
      >
        {t('stepComplete.title')}
      </Heading>*/}

      {/* Checkout Summary */}
      <VStack gap={2} align="start" w="full">
        <Box
          px={3}
          fontSize={'xs'}
          textTransform={'uppercase'}
          color={'#737373'}
          asChild
        >
          <Flex gap={1} alignItems={'center'}>
            {'Order details'}
          </Flex>
        </Box>

        {/* Email Address */}
        <HStack
          justify="space-between"
          w="full"
          bg={'brand.50'}
          py={2}
          px={3}
          h={8}
        >
          <Text minW={'8rem'} fontSize={'sm'} color={'brand.500'}>
            {t('stepComplete.email')}
          </Text>{' '}
          <Box flexGrow={1} pl={4}>
            {ctx.emailAddress}
          </Box>
        </HStack>

        {/* Billing Address */}
        <HStack
          justify="space-between"
          w="full"
          bg={'brand.50'}
          py={1}
          px={3}
          h={8}
          data-testid="billing-address-recap"
        >
          <Text minW={'8rem'} fontSize={'sm'} color={'brand.500'}>
            {t('stepComplete.billed_to')}
          </Text>
          <Box flexGrow={1} pl={4}>
            {renderBillingAddress()}
          </Box>
        </HStack>

        {/* License Owner */}
        <HStack
          justify="space-between"
          w="full"
          bg={'brand.50'}
          py={1}
          px={3}
          h={8}
        >
          <Text minW={'8rem'} fontSize={'sm'} color={'brand.500'}>
            {t('checkoutSummary.licenseOwnerLabel', 'License owner')}
          </Text>{' '}
          <Box flexGrow={1} pl={4}>
            {getLicenseOwnerDisplayValue()}
          </Box>
        </HStack>

        {/* Order Number */}
        <HStack
          justify="space-between"
          w="full"
          bg={'brand.50'}
          py={2}
          px={3}
          h={8}
          data-testid="complete-checkout-summary"
        >
          <Text minW={'8rem'} fontSize={'sm'} color={'brand.500'}>
            {t('stepComplete.description')}
          </Text>{' '}
          <Box flexGrow={1} pl={4}>
            {orderNumber}
          </Box>
        </HStack>

        {/* Payment recap */}
        <HStack
          justify="space-between"
          w="full"
          bg={'brand.50'}
          py={2}
          px={3}
          h={8}
          data-testid="complete-checkout-summary"
        >
          <Text minW={'8rem'} fontSize={'sm'} color={'brand.500'}>
            {t('stepComplete.payment')}
          </Text>{' '}
          <Box flexGrow={1} pl={4}>
            {ctx.isPaymentRequired ? (
              <PaymentSource readonly>
                {/*<PaymentSourceBrandIcon className="mr-2" />*/}
                <PaymentSourceBrandName>
                  {({ brand }) => {
                    if (ctx.isCreditCard) {
                      return (
                        <Trans i18nKey="stepPayment.endingIn">
                          {brand}
                          <PaymentSourceDetail type="last4" />
                        </Trans>
                      )
                    }
                    return <>{getTranslations(brand, t)}</>
                  }}
                </PaymentSourceBrandName>
              </PaymentSource>
            ) : (
              <Text>{t('stepComplete.free_payment')}</Text>
            )}
          </Box>
        </HStack>

        <Box mt={6}>
          <Button
            data-testid="button-continue-to-shop"
            onClick={handleClick}
            variant={'outline'}
            bg={'white'}
            borderRadius={'5rem'}
            size={'sm'}
            fontSize={'md'}
          >
            {t('stepComplete.continue')}
          </Button>
        </Box>

        {/*<Box>
        <Box>{t('stepComplete.summary_title')}</Box>
      </Box>*/}
        {/*<Box>{t('stepComplete.customer_title')}</Box>*/}
        {/*<>
        {ctx.isShipmentRequired && (
          <div data-testid="shipping-address-recap">
            <Heading>{t('stepComplete.ship_to')}</Heading>
            <Box>
              <CustomAddress
                firstName={ctx.shippingAddress?.first_name}
                lastName={ctx.shippingAddress?.last_name}
                city={ctx.shippingAddress?.city}
                line1={ctx.shippingAddress?.line_1}
                line2={ctx.shippingAddress?.line_2}
                zipCode={ctx.shippingAddress?.zip_code}
                stateCode={ctx.shippingAddress?.state_code}
                countryCode={ctx.shippingAddress?.country_code}
                phone={ctx.shippingAddress?.phone}
                addressType="shipping"
              />
            </Box>
          </div>
        )}
      </>*/}
      </VStack>
    </VStack>
  )
}
