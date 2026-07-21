'use client'

import { CheckoutButton } from '@/commercelayer/components/ui/checkout-button'
import { useCartContext } from '@/commercelayer/providers/cart'
import { useRouter } from 'next/navigation'
import { useRef } from 'react'

import EditLicenseOwnerDialog from '@/commercelayer/components/forms/edit-license-owner-dialog'
import EditLicenseSizeDialog from '@/commercelayer/components/forms/edit-license-size-dialog'
import { FieldsetLegend } from '@/commercelayer/components/ui/fieldset-legend'
import { InfoTip } from '@/components/ui/toggle-tip'
import {
  Box,
  Button,
  Center,
  Container,
  Fieldset,
  Flex,
  Heading,
  HStack,
  SimpleGrid,
  Spinner,
  Stack,
  Text,
  VStack,
} from '@chakra-ui/react'
import CartGroups from './cart-groups'
import Summary from './cart-summary'

const CartComponent = () => {
  const {
    isLoading,
    orderId,
    order,
    allLicenseInfoSet,
    isLicenseForClient,
    licenseSize,
    setLicenseSize,
    buyLabels,
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
        <Stack direction={'column'} gap={1} align="start" w="full">
          <HStack
            justify="space-between"
            w="full"
            borderBottom={'1px solid #919191'}
            fontSize={'sm'}
            lineHeight={1}
            py={0}
            pl={6}
            pr={4}
            h={6}
          >
            <Text
              minW={'10rem'}
              fontSize={'xs'}
              textTransform={'uppercase'}
              fontVariantNumeric={'tabular-nums'}
              color={'#737373'}
              asChild
            >
              <Flex gap={1} alignItems={'center'}>
                <span>
                  {cartLabels?.licenseHolder?.label || 'License holder'}
                </span>
                {cartLabels?.licenseHolder?.info && (
                  <InfoTip
                    content={
                      cartLabels?.licenseHolder?.info ||
                      'This is additional information about this fieldset'
                    }
                  />
                )}
              </Flex>
            </Text>
            <Box flexGrow={1} pl={4}>
              {isLicenseForClient
                ? order?.metadata?.license?.owner?.company
                : 'Yourself'}
            </Box>
            <EditLicenseOwnerDialog
              label={buyLabels?.licenseHolder?.label}
              info={buyLabels?.licenseHolder?.info}
              isLicenseForClient={isLicenseForClient}
            />
          </HStack>

          {
            <HStack
              justify="space-between"
              w="full"
              borderBottom={'1px solid #919191'}
              fontSize={'sm'}
              lineHeight={1}
              py={0}
              pl={6}
              pr={4}
              h={6}
            >
              <Text
                minW={'10rem'}
                fontSize={'xs'}
                textTransform={'uppercase'}
                fontVariantNumeric={'tabular-nums'}
                color={'#737373'}
                asChild
              >
                <Flex gap={1} alignItems={'center'}>
                  <span>{cartLabels?.companySize?.label}</span>
                  <InfoTip
                    content={
                      cartLabels?.companySize?.info ||
                      'This is additional information about this fieldset'
                    }
                  />
                </Flex>
              </Text>
              <Box flexGrow={1} pl={4}>
                {licenseSize?.label}
              </Box>
              <EditLicenseSizeDialog
                label={cartLabels?.companySize?.label}
                info={cartLabels?.companySize?.info}
                setLicenseSize={setLicenseSize}
              />
            </HStack>
          }
        </Stack>
        <Box>
          <Fieldset.Root>
            <Box display={['none', null, 'flex']} w={'full'}>
              <SimpleGrid columns={2} gap={4} mb={1} pl={6} pr={2} w={'full'}>
                <FieldsetLegend px={0} info={cartLabels?.fonts?.info}>
                  {cartLabels?.fonts?.label || 'Fonts'}
                </FieldsetLegend>
                <Flex justifyContent={'space-between'}>
                  <FieldsetLegend px={0} info={cartLabels?.licenseType?.info}>
                    {cartLabels?.licenseType?.label || 'License Type'}
                  </FieldsetLegend>
                  <FieldsetLegend px={0} info={cartLabels?.price?.info}>
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
          <CheckoutButton
            orderId={orderId || ''}
            isDisabled={!allLicenseInfoSet}
          />
        </VStack>
      </Stack>
    </Container>
  )
}

export default CartComponent
