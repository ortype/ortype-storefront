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
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import AddressFormDialog from '../address/address-form-dialog'
import { CustomerDetailsForm } from './customer-details-form'

function AddressesPage(): JSX.Element {
  const { t } = useTranslation()
  const router = useRouter()
  const [addressId, setAddressId] = useState(undefined)
  const [open, setOpen] = useState(false)
  const { addresses, deleteCustomerAddress } = useCustomerContext()

  const colSpan = addresses ? (addresses?.length % 2 === 1 ? 1 : 2) : 2

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
            <Grid
              templateColumns={'1fr 1fr'}
              gridGap={2}
              data-test-id="addresses-wrapper"
              w={'full'}
              mb={2}
            >
              {addresses &&
                addresses?.map((address, i) => {
                  return (
                    <GridItem
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
                          {address.zip_code} {address.city}
                        </Text>
                        <Text>
                          {address.state_code} ({address.country_code})
                        </Text>
                        {/*<Text>{address.phone}</Text>*/}
                        <Text mt={1}>{address.billing_info}</Text>
                      </VStack>
                      <Menu.Root
                        variant={'right'}
                        size={'sm'}
                        positioning={{ placement: 'bottom-end' }}
                      >
                        <Menu.Trigger
                          asChild
                          pos={'absolute'}
                          right={2}
                          top={2}
                        >
                          <IconButton
                            borderRadius={'full'}
                            variant="ghost"
                            bg={'white'}
                            _hover={{
                              bg: 'black',
                              color: 'white',
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
                                onClick={() => {
                                  address.id && setAddressId(address.id)
                                  setOpen(true)
                                }}
                                asChild
                              >
                                <Button variant={'plain'}>
                                  {'Edit address'}
                                </Button>
                              </Menu.Item>
                              <Menu.Item
                                value={'delete'}
                                onClick={() =>
                                  deleteCustomerAddress &&
                                  address.reference &&
                                  deleteCustomerAddress({
                                    customerAddressId: address.reference,
                                  })
                                }
                                asChild
                              >
                                <Button variant={'plain'}>{'Delete'}</Button>
                              </Menu.Item>
                            </Menu.Content>
                          </Menu.Positioner>
                        </Portal>
                      </Menu.Root>
                    </GridItem>
                  )
                })}
              <GridItem
                bg={'brand.50'}
                p={4}
                minH={24}
                pos={'relative'}
                justifyContent={'center'}
                alignItems={'center'}
                colSpan={colSpan}
                asChild
              >
                <AddButton
                  h={'full'}
                  onClick={() => {
                    setAddressId(undefined)
                    setOpen(true)
                  }}
                  // action={() => {
                  //   router.push(`/account/addresses/new`)
                  // }}
                  testId="show-new-address"
                />
              </GridItem>
            </Grid>
            <AddressFormDialog
              open={open}
              setOpen={setOpen}
              addressId={addressId}
            />
            {/*<Flex justify={'flex-start'}>
              <AddButton
                action={() => {
                  router.push(`/account/addresses/new`)
                }}
                testId="show-new-address"
              />
            </Flex>*/}
          </Card.Body>
          {/*<Card.Footer py={0}></Card.Footer>*/}
        </Card.Root>
      </VStack>
    </AddressesContainer>
  )
}

export default AddressesPage
