'use client'
import { EllipsisHorizontalIcon } from '@sanity/icons'

import Empty from '@/commercelayer/components/pages/account/empty'
import { AddButton } from '@/commercelayer/components/ui/add-button'
import AddressesContainer from '@/commercelayer/providers/addresses'
import { useCustomerContext } from '@/commercelayer/providers/customer'
import {
  Box,
  Button,
  Card,
  Flex,
  Grid,
  GridItem,
  Heading,
  IconButton,
  Menu,
  Portal,
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
        <Box
          px={3}
          fontSize={'xs'}
          textTransform={'uppercase'}
          color={'#737373'}
          mb={0}
          mt={2}
          asChild
        >
          <Flex gap={1} alignItems={'center'}>
            {t('addresses.title')}
          </Flex>
        </Box>
        <Card.Root w={'full'}>
          {/*<Card.Header>{t('addresses.title')}</Card.Header>*/}
          <Card.Body bg={'white'} p={0}>
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
              mb={2}
            >
              {addresses &&
                addresses?.map((address, i) => {
                  // @TODO: add context menu to:
                  // edit address
                  // (if there is more then 1 address)
                  // delete address
                  return (
                    <GridItem
                      // borderRadius={'l2'}
                      // border={'1px solid #d2d2d2'}
                      key={address.id}
                      bg={'brand.50'}
                      p={4}
                      pos={'relative'}
                    >
                      <VStack align="start" gap={2}>
                        {address?.company && <Text>{address.company}</Text>}

                        <Text>{address.full_name}</Text>

                        <Text>
                          {address.line_1}
                          {address.line_2 && `, ${address.line_2}`}
                        </Text>

                        <Text>
                          {address.city}, {address.state_code}{' '}
                          {address.zip_code}
                        </Text>

                        <Text>{address.country_code}</Text>
                      </VStack>
                      <Menu.Root variant={'subtle'}>
                        <Menu.Trigger
                          asChild
                          pos={'absolute'}
                          right={1}
                          top={1}
                        >
                          <IconButton
                            borderRadius={'full'}
                            variant="ghost"
                            _hover={{
                              bg: 'white',
                            }}
                            size="sm"
                          >
                            <EllipsisHorizontalIcon />
                          </IconButton>
                        </Menu.Trigger>
                        <Portal>
                          <Menu.Positioner>
                            <Menu.Content>
                              <Menu.Item
                                value={'edit'}
                                onClick={() =>
                                  router.push(
                                    `/account/addresses/${address.id}/edit`
                                  )
                                }
                              >
                                {'Edit address'}
                              </Menu.Item>
                              <Menu.Item
                                value={'delete'}
                                onClick={() =>
                                  deleteCustomerAddress &&
                                  deleteCustomerAddress({
                                    customerAddressId: address.id,
                                  })
                                }
                              >
                                {'Delete'}
                              </Menu.Item>
                            </Menu.Content>
                          </Menu.Positioner>
                        </Portal>
                      </Menu.Root>
                    </GridItem>
                  )
                })}
            </Grid>
            <Flex justify={'flex-end'}>
              <AddButton
                action={() => {
                  router.push(`/account/addresses/new`)
                }}
                testId="show-new-address"
              />
            </Flex>
          </Card.Body>
          {/*<Card.Footer py={0}></Card.Footer>*/}
        </Card.Root>

        {/*<Heading
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
        */}
      </VStack>
    </AddressesContainer>
  )
}

export default AddressesPage
