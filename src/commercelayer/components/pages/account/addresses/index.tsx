'use client'
import Empty from '@/commercelayer/components/pages/account/empty'
import { AddButton } from '@/commercelayer/components/ui/add-button'
import AddressesContainer from '@/commercelayer/providers/addresses'
import { useCustomerContext } from '@/commercelayer/providers/customer'
import {
  Box,
  Flex,
  Grid,
  GridItem,
  Heading,
  Text,
  VStack,
} from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import AddressesEmpty from './addresses-empty'
import { CustomerDetailsForm } from './customer-details-form'

function AddressesPage(): JSX.Element {
  const { t } = useTranslation()
  const router = useRouter()
  const { addresses, deleteCustomerAddress } = useCustomerContext()

  // On address cards enable a menu to trigger:
  // navigation to edit screen
  // deleteCustomerAddress

  // @TODO: "Your Addresses" card with Edit Address modal and New Address modal

  return (
    <AddressesContainer>
      <VStack gap={2} w={'full'} alignItems={'flex-start'}>
        <CustomerDetailsForm />
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
