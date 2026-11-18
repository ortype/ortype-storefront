import { LicenseOwner } from '@/commercelayer/providers/checkout'
import { getStateName } from '@/commercelayer/utils/country-utils'
import {
  Box,
  Flex,
  HStack,
  SimpleGrid,
  Text,
  VStack,
  Wrap,
  WrapItem,
} from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'

interface LicenseSummaryProps {
  owner: LicenseOwner
  size: any
}

export const LicenseSummary: React.FC<LicenseSummaryProps> = ({
  owner,
  size,
}) => {
  const { t } = useTranslation()

  if (!owner || !size) {
    return null
  }

  // Helper function to render billing address as wrapped components
  const renderBillingAddress = () => {
    if (!owner) return null

    const addressParts = []

    if (owner.line_1) addressParts.push(owner.line_1)
    if (owner.line_2) addressParts.push(owner.line_2)
    if (owner.city) addressParts.push(owner.city)
    if (owner.state_code)
      addressParts.push(getStateName(owner.country_code, owner.state_code))
    if (owner.zip_code) addressParts.push(owner.zip_code)
    if (owner.country_code) addressParts.push(owner.country_code)

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
    if (!owner) return ''

    // If it's a client license, show the company name
    if (owner.is_client && owner.company) {
      return owner.company
    }

    // Otherwise show the full name
    return owner.full_name || ''
  }

  return (
    <VStack gap={2} align='start' w='full' pb={4}>
      <VStack gap={1} align='start' w='full'>
        <Box
          px={3}
          mb={2}
          fontSize={'xs'}
          textTransform={'uppercase'}
          color={'#737373'}
        >
          {'License details'}
        </Box>
        <HStack
          justify='space-between'
          w='full'
          borderBottom={'1px solid #919191'}
          fontSize={'sm'}
          lineHeight={1}
          py={0}
          px={3}
          h={6}
        >
          <Text minW={'8rem'} color={'brand.500'}>
            {'Comany size'}
          </Text>{' '}
          <Box flexGrow={1} pl={4}>
            {size.label}
          </Box>
        </HStack>
        <HStack
          justify='space-between'
          w='full'
          borderBottom={'1px solid #919191'}
          fontSize={'sm'}
          lineHeight={1}
          py={0}
          px={3}
          h={6}
        >
          <Text minW={'8rem'} color={'brand.500'}>
            {t('checkoutSummary.billingAddressLabel', 'Billing address')}
          </Text>
          <Box flexGrow={1} pl={4}>
            {renderBillingAddress()}
          </Box>
        </HStack>
        <HStack
          justify='space-between'
          w='full'
          borderBottom={'1px solid #919191'}
          fontSize={'sm'}
          lineHeight={1}
          py={0}
          px={3}
          h={6}
        >
          <Text minW={'8rem'} color={'brand.500'}>
            {t('checkoutSummary.licenseOwnerLabel', 'License owner')}
          </Text>{' '}
          <Box flexGrow={1} pl={4}>
            {getLicenseOwnerDisplayValue()}
          </Box>
        </HStack>
      </VStack>
    </VStack>
  )

  return (
    <VStack gap={2} w={'full'} align={'start'}>
      <Box
        px={3}
        fontSize={'xs'}
        textTransform={'uppercase'}
        color={'#737373'}
        asChild
      >
        <Flex gap={1} alignItems={'center'}>
          {'License Details'}
        </Flex>
      </Box>
      <SimpleGrid columns={2} gap={2} w='full' bg={'brand.50'}>
        <VStack p={4} align='start' gap={2}>
          {owner.company && (
            <Text
              textDecoration={'underline'}
              textDecorationThickness={2}
              textUnderlineOffset={'0.1rem'}
            >
              {owner.company}
            </Text>
          )}

          <Text>{owner.full_name}</Text>

          <Text>
            {owner.line_1}
            {owner.line_2 && `, ${owner.line_2}`}
            {', '}
            {owner.city}
          </Text>

          <Text>
            {owner.zip_code} {owner.state_code} ({owner.country_code})
          </Text>

          <Text></Text>
        </VStack>
        <Box p={4}>
          <Box display={'inline-block'} bg={'#fff'} p={2} fontSize={'lg'}>
            {size.label}
          </Box>
          {/*<Badge variant={'solid'} size={'md'}>
            {size.label}
          </Badge>*/}
        </Box>
      </SimpleGrid>
    </VStack>
  )
}
