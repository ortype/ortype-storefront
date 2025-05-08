import LicenseOwnerInput from '@/commercelayer/components/forms/LicenseOwnerInput'
import { LicenseSizeList } from '@/commercelayer/components/forms/LicenseSizeList'
import { LicenseTypeList } from '@/commercelayer/components/forms/LicenseTypeList'
import { useBuyContext } from '@/commercelayer/providers/Buy'
import { useOrderContext } from '@/commercelayer/providers/Order'
import { Field } from '@/components/ui/field'
import {
  Box,
  Button,
  Container,
  Fieldset,
  Flex,
  SimpleGrid,
  Stack,
} from '@chakra-ui/react'
import Link from 'next/Link'
import CommerceLayer, { type SkuOption } from '@commercelayer/sdk'
import React from 'react'
import { BuySummary } from './BuySummary'
import { SingleStyles } from './SingleStyles'

const CheckoutButton = ({ isDisabled, order }) => {
  return (
    <Button
      variant={'solid'}
      bg={'red'}
      borderRadius={'5rem'}
      disabled={isDisabled}
      asChild
      maxW={'xs'}
    >
      <Link href={`/checkout/${order?.id}`}>{'Checkout'}</Link>
    </Button>
  )
}

export const Buy = () => {
  const {
    order,
    orderId,
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
      <Container maxW="container.lg" bg={'white'}>
        <Stack direction={'column'}>
          <SimpleGrid columns={2} gap={1}>
            <Box p={'1rem'}>
              <LicenseOwnerInput />
              <LicenseTypeList
                font={font}
                skuOptions={skuOptions}
                selectedSkuOptions={selectedSkuOptions}
                setSelectedSkuOptions={setSelectedSkuOptions}
              />
              {licenseSize && (
                <LicenseSizeList
                  setLicenseSize={setLicenseSize}
                  licenseSize={licenseSize}
                />
              )}
            </Box>
            <Box
              opacity={orderId ? 1 : 0.3}
              pointerEvents={orderId ? 'auto' : 'none'}
            >
              {font.variants?.map((variant) => (
                <Flex key={variant._id} direction={'column'} bg={'#EEE'} p={4}>
                  <SingleStyles
                    order={order}
                    orderId={orderId}
                    name={variant.name}
                    skuCode={variant._id}
                    addLineItem={addLineItem}
                    deleteLineItem={deleteLineItem}
                    licenseSize={licenseSize}
                    selectedSkuOptions={selectedSkuOptions}
                  />
                </Flex>
              ))}
            </Box>
          </SimpleGrid>
          <BuySummary />
          <CheckoutButton order={order} isDisabled={false} />
        </Stack>
      </Container>
    </>
  )
}

export default Buy
