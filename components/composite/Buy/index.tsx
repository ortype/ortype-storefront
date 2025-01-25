import LicenseOwnerInput from '@/commercelayer/components/forms/LicenseOwnerInput'
import { LicenseSizeSelect } from '@/commercelayer/components/forms/LicenseSizeSelect'
import { LicenseTypeSelect } from '@/commercelayer/components/forms/LicenseTypeSelect'
import { useBuyContext } from '@/commercelayer/providers/Buy'
import { useOrderContext } from '@/commercelayer/providers/Order'
import { Field } from '@/components/ui/field'
import {
  Box,
  Container,
  Fieldset,
  Flex,
  SimpleGrid,
  Stack,
} from '@chakra-ui/react'
import CommerceLayer, { type SkuOption } from '@commercelayer/sdk'
import React from 'react'
import { BuySummary } from './BuySummary'
import { SingleStyles } from './SingleStyles'

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
          <SimpleGrid columns={2} spacing={2}>
            <Box p={'1rem'}>
              <LicenseOwnerInput />
              <Fieldset.Root>
                <Field label={'A license for?'}>
                  <LicenseTypeSelect
                    font={font}
                    skuOptions={skuOptions}
                    selectedSkuOptions={selectedSkuOptions}
                    setSelectedSkuOptions={setSelectedSkuOptions}
                  />
                </Field>
              </Fieldset.Root>
              <Fieldset.Root>
                <Field label={'How big is your company?'}>
                  {licenseSize && (
                    <LicenseSizeSelect
                      setLicenseSize={setLicenseSize}
                      licenseSize={licenseSize}
                    />
                  )}
                </Field>
              </Fieldset.Root>
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
          {/*<BuySummary />*/}
        </Stack>
      </Container>
    </>
  )
}

export default Buy
