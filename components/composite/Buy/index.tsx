import {
  Container,
  Flex,
  FormControl,
  FormLabel,
  SimpleGrid,
  Stack,
  Text,
} from '@chakra-ui/react'
import { OrderContainer, OrderStorage } from '@commercelayer/react-components'
import CommerceLayer, { type SkuOption } from '@commercelayer/sdk'
import { BuyContext } from 'components/data/BuyProvider'
import { CustomerContext } from 'components/data/CustomerProvider'
import React, { useContext, useEffect, useState } from 'react'
import { BuySummary } from './BuySummary'
import { LicenseSizeSelect } from './LicenseSizeSelect'
import { LicenseTypeSelect } from './LicenseTypeSelect'
import { SingleStyles } from './SingleStyles'

export const Buy = () => {
  const {
    font,
    order,
    accessToken,
    skuOptions,
    selectedSkuOptions,
    setSelectedSkuOptions,
    setLicenseSize,
    addLineItem,
    deleteLineItem,
    licenseSize,
  } = useContext(BuyContext)

  let cl
  if (accessToken) {
    cl = CommerceLayer({
      organization: process.env.NEXT_PUBLIC_CL_SLUG || '',
      accessToken: accessToken,
    })
  }

  // @TODO: on changing selected SKU options, update all line_items on the order

  if (!skuOptions || skuOptions.length < 1) {
    return <div>{'Loading...'}</div>
  }

  return (
    <>
      <Container maxW="container.lg">
        <Stack direction={'column'}>
          <SimpleGrid columns={2} spacing={2}>
            <FormControl>
              <FormLabel>{'A license for?'}</FormLabel>
              <LicenseTypeSelect
                cl={cl}
                skuOptions={skuOptions}
                selectedSkuOptions={selectedSkuOptions}
                setSelectedSkuOptions={setSelectedSkuOptions}
              />
            </FormControl>
            <FormControl>
              <FormLabel>{'How big is your company?'}</FormLabel>
              {licenseSize && (
                <LicenseSizeSelect
                  cl={cl}
                  setLicenseSize={setLicenseSize}
                  licenseSize={licenseSize}
                />
              )}
            </FormControl>
          </SimpleGrid>
          {font.variants?.map((variant) => (
            <Flex key={variant._id} direction={'column'} bg={'#EEE'} p={4}>
              <SingleStyles
                order={order}
                name={variant.name}
                skuCode={variant._id}
                addLineItem={addLineItem}
                deleteLineItem={deleteLineItem}
                licenseSize={licenseSize}
                selectedSkuOptions={selectedSkuOptions}
              />
            </Flex>
          ))}
          {/*<BuySummary />*/}
        </Stack>
      </Container>
    </>
  )
}

export default Buy
