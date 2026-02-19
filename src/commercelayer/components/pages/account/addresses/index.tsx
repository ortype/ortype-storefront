'use client'
import Empty from '@/commercelayer/components/pages/account/empty'
import { AddButton } from '@/commercelayer/components/ui/add-button'
import CustomerAddressCard from '@/components/ui/Account/CustomerAddressCard'
import { Box, Flex, Grid, Heading, VStack } from '@chakra-ui/react'
import { AddressesContainer } from '@commercelayer/react-components/addresses/AddressesContainer'
import { AddressesEmpty } from '@commercelayer/react-components/addresses/AddressesEmpty'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'

function AddressesPage(): JSX.Element {
  const { t } = useTranslation()
  const router = useRouter()

  // @TODO: check if user is logged in, if not show auth page
  // @TODO: rename to "Profile" and call menu item "Account"
  // @TODO: "Your details": with `name`, `Company name / Studio`, `Email`
  // we can use customer metadata to store fields like `name`
  // and password change functionality
  // @TOOD: "Your Addresses" card with Edit Address modal and New Address modal

  return (
    <AddressesContainer>
      <VStack gap={4} w={'full'} alignItems={'flex-start'}>
        <Heading
          as={'h5'}
          fontSize={'xl'}
          textTransform={'uppercase'}
          fontWeight={'normal'}
        >
          {'Your details'}
        </Heading>
        <Box bg={'brand.50'} p={4}>
          {'Name, Company name / Studio, Email, Password management'}
        </Box>
        <Heading
          as={'h5'}
          fontSize={'xl'}
          textTransform={'uppercase'}
          fontWeight={'normal'}
        >
          {t('addresses.title')}
        </Heading>
        <Box bg={'brand.50'} p={4}>
          <AddressesEmpty>{() => <Empty type="Addresses" />}</AddressesEmpty>
          <Grid data-test-id="addresses-wrapper">
            <CustomerAddressCard />
          </Grid>
        </Box>
        <Flex justifyContent={'flex-end'} my={2} w={'full'}>
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
