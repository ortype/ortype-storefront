import { LicenseOwner } from '@/commercelayer/providers/checkout'
import { sizes } from '@/theme/tokens/sizes'
import {
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  SimpleGrid,
  Text,
  VStack,
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
      <SimpleGrid columns={2} gap={2} w="full" bg={'brand.50'}>
        <VStack p={4} align="start" gap={2}>
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
