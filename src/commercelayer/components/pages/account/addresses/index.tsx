'use client'
import Empty from '@/commercelayer/components/pages/account/empty'
import { AddButton } from '@/commercelayer/components/ui/add-button'
import { FloatingLabelInput } from '@/commercelayer/components/ui/floating-label-input'
import AddressesContainer from '@/commercelayer/providers/addresses'
import { useCustomerContext } from '@/commercelayer/providers/customer'
import {
  Box,
  Flex,
  Grid,
  GridItem,
  Heading,
  Stack,
  Text,
  VStack,
} from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import AddressesEmpty from './addresses-empty'

function AddressesPage(): JSX.Element {
  const { t } = useTranslation()
  const router = useRouter()
  const { addresses, customers } = useCustomerContext()

  // @TODO: "Your details": with `name`, `Company name / Studio`, `Email`
  // we can use customer metadata to store fields like `name`
  // and password change functionality
  // @TOOD: "Your Addresses" card with Edit Address modal and New Address modal

  // change handler connected to customer ctx?

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
            value={customers?.metadata?.full_name}
            // onChange={(e) => setCardholderName(e.target.value)}
            variant="subtle"
            size="lg"
            fontSize="md"
            borderRadius={0}
          />
          <FloatingLabelInput
            label={'Company name / Studio'}
            value={customers?.metadata?.company_name}
            // onChange={(e) => setCardholderName(e.target.value)}
            variant="subtle"
            size="lg"
            fontSize="md"
            borderRadius={0}
          />
          <FloatingLabelInput
            label={'Email'}
            value={customers?.email}
            // onChange={(e) => setCardholderName(e.target.value)}
            variant="subtle"
            size="lg"
            fontSize="md"
            borderRadius={0}
          />
          <FloatingLabelInput
            label={'Password'}
            value={''} // @TODO
            // customers.has_password
            // hook this into an update password API call
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

        <AddressesEmpty>
          {() => (
            <Box bg={'brand.50'} p={4} w={'full'}>
              <Empty type="Addresses" />
            </Box>
          )}
        </AddressesEmpty>

        <Grid
          templateColumns={'1fr 1fr'}
          gridGap={2}
          data-test-id="addresses-wrapper"
          w={'full'}
        >
          {addresses &&
            addresses?.map((address, i) => {
              // @TODO: add context menu to:
              // edit address
              // (if there is more then 1 address)
              // delete address
              return (
                <GridItem
                  key={address.id}
                  bg={'brand.50'}
                  p={4}
                  cursor={'pointer'}
                  onClick={() =>
                    router.push(`/account/addresses/${address.id}/edit`)
                  }
                >
                  <VStack align="start" gap={2}>
                    {address?.company && <Text>{address.company}</Text>}

                    <Text>{address.full_name}</Text>

                    <Text>
                      {address.line_1}
                      {address.line_2 && `, ${address.line_2}`}
                    </Text>

                    <Text>
                      {address.city}, {address.state_code} {address.zip_code}
                    </Text>

                    <Text>{address.country_code}</Text>
                  </VStack>
                </GridItem>
              )
            })}
        </Grid>
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
