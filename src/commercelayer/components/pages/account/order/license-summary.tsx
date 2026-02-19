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
      {/*<Heading
        as={'h5'}
        fontSize={'xl'}
        textTransform={'uppercase'}
        fontWeight={'normal'}
      >
        {'License Owner & Metrics'}
      </Heading>*/}
      <SimpleGrid columns={2} gap={2} w="full">
        <Box>
          <Box
            px={3}
            fontSize={'xs'}
            textTransform={'uppercase'}
            color={'#737373'}
            asChild
            mb={2}
          >
            <Flex gap={1} alignItems={'center'}>
              {'License Owner'}
            </Flex>
          </Box>
          <VStack p={4} align="start" gap={2} bg={'brand.50'}>
            {owner.company && <Text>{owner.company}</Text>}

            <Text>{owner.full_name}</Text>

            <Text>
              {owner.line_1}
              {owner.line_2 && `, ${owner.line_2}`}
            </Text>

            <Text>
              {owner.city}, {owner.state_code} {owner.zip_code}
            </Text>

            <Text>{owner.country_code}</Text>
          </VStack>
        </Box>
        <Box>
          <Box
            px={3}
            fontSize={'xs'}
            textTransform={'uppercase'}
            color={'#737373'}
            asChild
            mb={2}
          >
            <Flex gap={1} alignItems={'center'}>
              {'License Metrics'}
            </Flex>
          </Box>
          <Badge variant={'solid'} size={'md'}>
            {size.label}
          </Badge>
        </Box>
      </SimpleGrid>
    </VStack>
  )
}
