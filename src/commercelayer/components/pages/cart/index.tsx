'use client'
import { LicenseSizeSelect } from '@/commercelayer/components/forms/LicenseSizeSelect'
import { CheckoutButton } from '@/commercelayer/components/ui/checkout-button'
import { useCartContext } from '@/commercelayer/providers/cart'
import { useRouter } from 'next/navigation'
import { useRef } from 'react'

import { FieldsetLegend } from '@/commercelayer/components/ui/fieldset-legend'
import {
  Box,
  Button,
  Center,
  Container,
  Fieldset,
  Flex,
  Heading,
  SimpleGrid,
  Spinner,
  Stack,
  Text,
  VStack,
} from '@chakra-ui/react'
import Summary from './cart-summary'
import CartGroups from './cart-groups'

const CartComponent = () => {
  const {
    isLoading,
    orderId,
    order,
    isLicenseForClient,
    licenseSize,
    setLicenseSize,
    cartLabels,
    groupedLineItems,
  } = useCartContext()

  const router = useRouter()

  const handleClick = () => {
    router.push(`/`)
  }

  const hasInitializedRef = useRef(false)
  const isReady = !isLoading && orderId && order

  // Once ready, never show spinner again
  if (isReady) {
    hasInitializedRef.current = true
  }

  if (isLoading && !hasInitializedRef.current) {
    return (
      <Box pos="fixed" inset="0" bg="bg/80">
        <Center h="full">
          <Spinner color="black" size={'xl'} />
        </Center>
      </Box>
    )
  }

  // Show error if orderId is missing
  if (!orderId || groupedLineItems.length === 0) {
    return (
      <Box pos="fixed" inset="0" bg="bg/80">
        <Center h="full">
          <VStack gap={6}>
            <Text fontSize={'2xl'}>{'No items in your cart 😢'}</Text>

            <Button
              onClick={handleClick}
              variant={'outline'}
              bg={'white'}
              borderRadius={'5rem'}
              size={'sm'}
              fontSize={'md'}
            >
              {'Continue shopping'}
            </Button>
          </VStack>
        </Center>
      </Box>
    )
  }

  return (
    <Container my={6} maxW={'60rem'}>
      <Heading
        textAlign={'center'}
        fontSize={'2rem'}
        fontWeight={'normal'}
        textTransform={'uppercase'}
        mx={'auto'}
        pb={8}
      >
        Cart or Bag Or Basket
      </Heading>

      <Stack direction={'column'} gap={6}>
        <SimpleGrid columns={[1, null, 2]} gap={3}>
          <Fieldset.Root>
            <FieldsetLegend info={cartLabels?.licenseHolder?.info}>
              {cartLabels?.licenseHolder?.label || 'License holder'}
            </FieldsetLegend>
            <Fieldset.Content asChild>
              <Flex
                bg={'colorPalette.bg'}
                justifyContent={'center'}
                px={'3'}
                h={11}
                fontSize={{ base: 'lg', xl: 'md' }}
                mt={1}
                borderRadius={'100px'}
                border={'2px solid #000'}
              >
                {isLicenseForClient
                  ? order?.metadata?.license?.owner?.company
                  : 'Yourself'}
              </Flex>
            </Fieldset.Content>
          </Fieldset.Root>

          {licenseSize && (
            <LicenseSizeSelect
              label={cartLabels?.companySize?.label}
              info={cartLabels?.companySize?.info}
              setLicenseSize={setLicenseSize}
              licenseSize={licenseSize}
            />
          )}
        </SimpleGrid>
        <Box>
          <Fieldset.Root>
            <Box display={['none', null, 'flex']} w={'full'}>
              <SimpleGrid columns={2} gap={4} mb={1} w={'full'}>
                <FieldsetLegend info={cartLabels?.fonts?.info}>
                  {cartLabels?.fonts?.label || 'Fonts'}
                </FieldsetLegend>
                <Flex justifyContent={'space-between'}>
                  <FieldsetLegend info={cartLabels?.licenseType?.info}>
                    {cartLabels?.licenseType?.label || 'License Type'}
                  </FieldsetLegend>
                  <FieldsetLegend info={cartLabels?.price?.info}>
                    <Box pr={4}>{cartLabels?.price?.label || 'Price'}</Box>
                  </FieldsetLegend>
                </Flex>
              </SimpleGrid>
            </Box>
            <Box display={['block', null, 'none']} mb={2}>
              <FieldsetLegend>{'Items'}</FieldsetLegend>
            </Box>
          </Fieldset.Root>
          <CartGroups groupedLineItems={groupedLineItems} />
        </Box>
        <VStack maxW={'60rem'}>
          <Summary />
          <CheckoutButton orderId={orderId || ''} isDisabled={false} />
        </VStack>
      </Stack>
    </Container>
  )
}

export default CartComponent
