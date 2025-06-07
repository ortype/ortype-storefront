import LicenseOwnerInput from '@/commercelayer/components/forms/LicenseOwnerInput'
import { LicenseSizeList } from '@/commercelayer/components/forms/LicenseSizeList'
import { LicenseTypeList } from '@/commercelayer/components/forms/LicenseTypeList'
import { useBuyContext } from '@/commercelayer/providers/Buy'
import { useOrderContext } from '@/commercelayer/providers/Order'
import { Field } from '@/components/ui/field'
import { InfoTip } from '@/components/ui/toggle-tip'
import {
  Box,
  Button,
  Container,
  Fieldset,
  Flex,
  Group,
  SimpleGrid,
  Stack,
} from '@chakra-ui/react'
import CommerceLayer, { type SkuOption } from '@commercelayer/sdk'
import Link from 'next/link'
import React from 'react'
import { BuySummary } from './BuySummary'
import { SingleStyles } from './SingleStyles'

export const CheckoutButton = ({ isDisabled, order }) => {
  return (
    <Button
      variant={'solid'}
      bg={'red'}
      borderRadius={'5rem'}
      disabled={isDisabled}
      asChild
      size={'sm'}
      fontSize={'md'}
      alignSelf={'center'}
    >
      <Link href={`/checkout/${order?.id}`}>{'Checkout'}</Link>
    </Button>
  )
}

export const FieldsetLegend = ({ children }) => {
  return (
    <Fieldset.Legend
      px={3}
      fontSize={'xs'}
      textTransform={'uppercase'}
      color={'#737373'}
      asChild
    >
      <Flex gap={1} alignItems={'center'}>
        {children}
        <InfoTip
          content={'This is additional information about this fieldset'}
        />
      </Flex>
    </Fieldset.Legend>
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
      <Container maxW="60rem" bg={'white'}>
        <Stack direction={'column'} gap={6}>
          <SimpleGrid columns={2} gap={3}>
            <Stack direction={'column'} gap={4}>
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
            </Stack>
            <Fieldset.Root>
              <FieldsetLegend>{'Single Styles'}</FieldsetLegend>
              <Fieldset.Content asChild>
                <Flex
                  mt={1}
                  opacity={orderId ? 1 : 0.3}
                  pointerEvents={orderId ? 'auto' : 'none'}
                  bg={'#EEE'}
                  p={2}
                  gap={2}
                >
                  {font.variants?.map((variant) => (
                    <SingleStyles
                      key={variant._id}
                      className={variant._id}
                      order={order}
                      orderId={orderId}
                      name={`${font.shortName} ${variant.optionName}`}
                      skuCode={variant._id}
                      addLineItem={addLineItem}
                      deleteLineItem={deleteLineItem}
                      licenseSize={licenseSize}
                      selectedSkuOptions={selectedSkuOptions}
                    />
                  ))}
                </Flex>
              </Fieldset.Content>
            </Fieldset.Root>
          </SimpleGrid>
          <BuySummary />
          <CheckoutButton order={order} isDisabled={false} />
        </Stack>
      </Container>
    </>
  )
}

export default Buy
