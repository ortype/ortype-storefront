import LicenseOwnerInput from '@/commercelayer/components/forms/LicenseOwnerInput'
import { LicenseSizeList } from '@/commercelayer/components/forms/LicenseSizeList'
import { LicenseTypeList } from '@/commercelayer/components/forms/LicenseTypeList'
import { useBuyContext } from '@/commercelayer/providers/Buy'
import { useOrderContext } from '@/commercelayer/providers/Order'
import { InfoTip } from '@/components/ui/toggle-tip'
import {
  Box,
  Button,
  Center,
  Container,
  Fieldset,
  Flex,
  Show,
  SimpleGrid,
  Spinner,
  Stack,
} from '@chakra-ui/react'
import Link from 'next/link'
import React from 'react'
import { BuySummary } from './buy-summary'
import { SingleStyles } from './single-styles'

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
      fontVariantNumeric={'tabular-nums'}
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
    isLoading,
    licenseSize,
    skuOptions,
    setLicenseSize,
    deleteLineItem,
    selectedSkuOptions,
    setSelectedSkuOptions,
    allLicenseInfoSet,
    hasLineItems,
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
              <LicenseSizeList
                setLicenseSize={setLicenseSize}
                licenseSize={licenseSize}
              />
            </Stack>
            <Fieldset.Root>
              <FieldsetLegend>{'4. Single Styles'}</FieldsetLegend>
              <Fieldset.Content asChild>
                <Flex
                  mt={1}
                  opacity={allLicenseInfoSet ? 1 : 0.3}
                  pointerEvents={allLicenseInfoSet ? 'auto' : 'none'}
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
          <Show when={order && hasLineItems}>
            <CheckoutButton order={order} isDisabled={!allLicenseInfoSet} />
          </Show>
        </Stack>
      </Container>
      <Show when={isLoading}>
        <Box pos="absolute" inset="0" bg="bg/80">
          <Center h="full">
            <Spinner color="black" size={'xl'} />
          </Center>
        </Box>
      </Show>
    </>
  )
}

export default Buy
