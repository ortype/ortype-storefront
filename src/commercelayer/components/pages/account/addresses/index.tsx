'use client'
import Empty from '@/commercelayer/components/pages/account/empty'
import { AddButton } from '@/commercelayer/components/ui/add-button'
import CustomerAddressCard from '@/components/ui/Account/CustomerAddressCard'
import { Box, Flex, Grid, Heading, Stack, VStack } from '@chakra-ui/react'
// import { AddressesContainer } from '@commercelayer/react-components/addresses/AddressesContainer'
import { FloatingLabelInput } from '@/commercelayer/components/ui/floating-label-input'
import AddressesContainer from '@/commercelayer/providers/addresses'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import AddressesEmpty from './addresses-empty'

function AddressesPage(): JSX.Element {
  const { t } = useTranslation()
  const router = useRouter()

  // @TODO: "Your details": with `name`, `Company name / Studio`, `Email`
  // we can use customer metadata to store fields like `name`
  // and password change functionality
  // @TOOD: "Your Addresses" card with Edit Address modal and New Address modal

  return (
    <AddressesContainer>
      <VStack gap={2} w={'full'} alignItems={'flex-start'}>
        <Heading
          as={'h5'}
          fontSize={'xl'}
          textTransform={'uppercase'}
          fontWeight={'normal'}
        >
          {'Your details'}
        </Heading>
        <Stack direction="column" gap={2} mb={2} w={'full'}>
          <FloatingLabelInput
            label={'Name'}
            value={''}
            // onChange={(e) => setCardholderName(e.target.value)}
            variant="subtle"
            size="lg"
            fontSize="md"
            borderRadius={0}
          />
          <FloatingLabelInput
            label={'Company name / Studio'}
            value={''}
            // onChange={(e) => setCardholderName(e.target.value)}
            variant="subtle"
            size="lg"
            fontSize="md"
            borderRadius={0}
          />
          <FloatingLabelInput
            label={'Email'}
            value={''}
            // onChange={(e) => setCardholderName(e.target.value)}
            variant="subtle"
            size="lg"
            fontSize="md"
            borderRadius={0}
          />
          <FloatingLabelInput
            label={'Password'}
            value={''}
            // onChange={(e) => setCardholderName(e.target.value)}
            variant="subtle"
            size="lg"
            fontSize="md"
            borderRadius={0}
          />
        </Stack>
        <Heading
          as={'h5'}
          fontSize={'xl'}
          textTransform={'uppercase'}
          fontWeight={'normal'}
        >
          {t('addresses.title')}
        </Heading>
        <Box bg={'brand.50'} p={4} w={'full'}>
          <AddressesEmpty>{() => <Empty type="Addresses" />}</AddressesEmpty>
          <Grid data-test-id="addresses-wrapper">
            <CustomerAddressCard />
          </Grid>
        </Box>
        <Flex justifyContent={'flex-start'} my={2} w={'full'}>
          <AddButton
            action={() => {
              router.push(`/account/addresses/new`)
            }}
            testId="show-new-address"
          />
        </Flex>
      </VStack>
    </AddressesContainer>
  )
}

export default AddressesPage
