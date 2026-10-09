'use client'

import { useCartContext } from '@/commercelayer/providers/cart'
import { useRouter } from 'next/navigation'
import { useRef } from 'react'

import EditLicenseMetricsDialog from '@/commercelayer/components/forms/edit-license-metrics-dialog'
import { FieldsetLegend } from '@/commercelayer/components/ui/fieldset-legend'
import { InfoTip } from '@/components/ui/toggle-tip'
import {
  Box,
  Button,
  Center,
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
import CartActionBar from './cart-action-bar'
import CartGroups from './cart-groups'
import CartSummary from './cart-summary'

const CartComponent = () => {
  const {
    isLoading,
    orderId,
    order,
    isLicenseForClient,
    licenseOwner,
    licenseSize,
    setLicenseSize,
    cartLabels,
    groupedLineItems,
    isDirty,
    isSaving,
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
      <Box pos='fixed' inset='0' bg='bg/80'>
        <Center h='full'>
          <Spinner color='black' size={'xl'} />
        </Center>
      </Box>
    )
  }

  // Nothing to show. Not while edits are staged or saving: removing every item
  // is still an unsaved change, and the action bar (Update / Discard) must stay.
  const isEmpty = groupedLineItems.length === 0
  if (!orderId || (isEmpty && !isDirty && !isSaving)) {
    return (
      <Box pos='fixed' inset='0' bg='bg/80'>
        <Center h='full'>
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
    <Box pos={'relative'}>
      <Box
        maxW={['100%']}
        ml={{
          base: '1rem',
          // '2xl': '20rem',
          // '3xl': '23rem',
        }}
        mr={{
          base: '1rem',
          lg: '18rem',
          '2xl': '20rem',
          '3xl': '23rem',
        }}
        position={'relative'}
        my={6}
        px={6}
      >
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
          <Box>
            <SimpleGrid columns={2} gap={3} px={4} w={'full'}>
              <HStack
                justify='space-between'
                w='full'
                fontSize={'sm'}
                lineHeight={1}
                h={6}
              >
                <Text
                  minW={'8rem'}
                  fontSize={'xs'}
                  textTransform={'uppercase'}
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
              </HStack>

              <HStack
                justify='space-between'
                w='full'
                fontSize={'sm'}
                lineHeight={1}
                pl={7}
                h={6}
              >
                <Text
                  minW={'8rem'}
                  fontSize={'xs'}
                  textTransform={'uppercase'}
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
              </HStack>
            </SimpleGrid>
            <SimpleGrid
              columns={2}
              gap={10}
              mb={1}
              pl={2}
              pr={4}
              w={'full'}
              alignItems={'center'}
              bg={'#FEF8D7'}
              borderRadius={'full'}
              minH={12}
            >
              <Box flexGrow={1} pl={4} fontSize={'md'} lineHeight={1}>
                {isLicenseForClient ? licenseOwner?.company : 'Yourself'}
              </Box>

              <HStack
                justify='space-between'
                w='full'
                fontSize={'md'}
                lineHeight={1}
                h={6}
              >
                <Box flexGrow={1} pl={4}>
                  {licenseSize?.label}
                </Box>
                <EditLicenseMetricsDialog
                  label={cartLabels?.companySize?.label}
                  info={cartLabels?.companySize?.info}
                  setLicenseSize={setLicenseSize}
                  isLicenseForClient={isLicenseForClient}
                />
              </HStack>
            </SimpleGrid>
          </Box>
          <Box>
            <Fieldset.Root>
              <Box display={['none', null, 'flex']} w={'full'}>
                <SimpleGrid
                  columns={2}
                  gap={5}
                  mb={1}
                  pl={4}
                  pr={2}
                  w={'full'}
                >
                  <FieldsetLegend px={0} info={cartLabels?.fonts?.info}>
                    {cartLabels?.fonts?.label || 'Fonts'}
                  </FieldsetLegend>
                  <Flex justifyContent={'space-between'} pl={5}>
                    <FieldsetLegend
                      px={0}
                      info={cartLabels?.licenseType?.info}
                    >
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
            {isEmpty && (
              <Text py={6}>{'Everything removed from your cart.'}</Text>
            )}
            <CartGroups groupedLineItems={groupedLineItems} />
          </Box>
        </Stack>
      </Box>
      <VStack
        pos={{ base: 'relative', lg: 'fixed' }}
        right={{ base: 'auto', lg: 4 }}
        top={{ base: 'auto', lg: 16 }}
        px={{ base: '1rem', lg: 0 }}
        pb={{ base: '1rem', lg: 0 }}
        w={{
          base: '100%',
          lg: '16rem',
          '2xl': '17rem',
          '3xl': '18rem',
        }}
        gap={0}
      >
        <CartSummary />
        <CartActionBar />
      </VStack>
    </Box>
  )
}

export default CartComponent
