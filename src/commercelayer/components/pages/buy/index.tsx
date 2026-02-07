import LicenseOwnerInput from '@/commercelayer/components/forms/LicenseOwnerInput'
import { LicenseSizeList } from '@/commercelayer/components/forms/LicenseSizeList'
import { LicenseTypeList } from '@/commercelayer/components/forms/LicenseTypeList'
import { useBuyContext } from '@/commercelayer/providers/buy'
import { useOrderContext } from '@/commercelayer/providers/Order'
import { StickyBottomPanel } from '@/commercelayer/components/ui/sticky-bottom-panel'
import { OrderSummary } from '@/commercelayer/components/ui/order-summary'
import { LockIcon } from '@sanity/icons'
import { CheckoutButton } from '@/commercelayer/components/ui/checkout-button'
import { FieldsetLegend } from '@/commercelayer/components/ui/fieldset-legend'
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
  HStack,
} from '@chakra-ui/react'
import Link from 'next/link'
import React from 'react'
import { SingleStyles } from './single-styles'

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

  return (
    <>
      <Container maxW="60rem" position={'relative'}>
        <SimpleGrid columns={[1, null, 2]} gap={3}>
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
        <StickyBottomPanel
          maxW={'60rem'}
          showFooter={order && hasLineItems}
          footer={() => (
            <CheckoutButton order={order} isDisabled={!allLicenseInfoSet} />
          )}
        >
          {({ isExpanded, toggleBox }) => (
            <OrderSummary
              order={order}
              hasLineItems={hasLineItems}
              isOpen={isExpanded}
              toggleBox={toggleBox}
              heading="What's in your cart"
            />
          )}
        </StickyBottomPanel>
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
