import LicenseOwnerInput from '@/commercelayer/components/forms/LicenseOwnerInput'
import { useBuyContext } from '@/commercelayer/providers/Buy'
import { useOrderContext } from '@/commercelayer/providers/Order'
import {
  Box,
  Container,
  Flex,
  FormControl,
  FormLabel,
  SimpleGrid,
  Stack,
} from '@chakra-ui/react'
import CommerceLayer, { type SkuOption } from '@commercelayer/sdk'
import React from 'react'
import { BuySummary } from './BuySummary'
import { LicenseSizeSelect } from './LicenseSizeSelect'
import { LicenseTypeSelect } from './LicenseTypeSelect'
import { SingleStyles } from './SingleStyles'

export const Buy = () => {
  const {
    order,
    licenseSize,
    skuOptions,
    setLicenseSize,
    deleteLineItem,
    selectedSkuOptions,
    setSelectedSkuOptions,
  } = useOrderContext()
  const { font, addLineItem } = useBuyContext()

  // @TODO: on changing selected SKU options, update all line_items on the order

  if (!skuOptions || skuOptions.length < 1) {
    return <div>{'Loading...'}</div>
  }

  return (
    <>
      <Container maxW="container.lg">
        <Stack direction={'column'}>
          <SimpleGrid columns={2} spacing={2}>
            <Box bg={'white'}>
              <LicenseOwnerInput />
            </Box>
            <FormControl>
              <FormLabel>{'A license for?'}</FormLabel>
              <LicenseTypeSelect
                font={font}
                skuOptions={skuOptions}
                selectedSkuOptions={selectedSkuOptions}
                setSelectedSkuOptions={setSelectedSkuOptions}
              />
            </FormControl>
            <FormControl>
              <FormLabel>{'How big is your company?'}</FormLabel>
              {licenseSize && (
                <LicenseSizeSelect
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
