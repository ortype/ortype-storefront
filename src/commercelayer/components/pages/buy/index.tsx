import LicenseOwnerRadio from '@/commercelayer/components/forms/license-owner-radio'
import { LicenseSizeList } from '@/commercelayer/components/forms/LicenseSizeList'
import { LicenseTypeList } from '@/commercelayer/components/forms/LicenseTypeList'
import { FieldsetLegend } from '@/commercelayer/components/ui/fieldset-legend'
import { useBuyContext } from '@/commercelayer/providers/buy'
import { useOrderContext } from '@/commercelayer/providers/Order'
import {
  Box,
  Button,
  Link as ChakraLink,
  Fieldset,
  Flex,
  GridItem,
  Show,
  SimpleGrid,
  Spinner,
  Text,
  VStack,
} from '@chakra-ui/react'
import Link from 'next/link'
import React, { useState } from 'react'
import Typefaces from './typefaces'

interface FontVariant {
  _id: string
  optionName: string
  parentUid: string
}

interface FontGroup {
  _type: string
  groupName: string
  variants: FontVariant[]
  italicVariants: FontVariant[]
}

export const Buy = () => {
  const {
    licenseSize,
    skuOptions,
    setLicenseSize,
    selectedSkuOptions,
    setSelectedSkuOptions,
    allLicenseInfoSet,
    isCreatingOrder,
    buyLabels,
    isGroupCommitted,
    commitGroup,
  } = useOrderContext()
  const { font, summary } = useBuyContext()

  // Add to cart / Go to cart button state
  const [isCommitting, setIsCommitting] = useState(false)
  const fontUid = font.uid!
  const groupIsCommitted = isGroupCommitted(fontUid)

  const licensesCount = selectedSkuOptions?.length

  // All pricing now derived from the selection buffer via BuyProvider
  const {
    show,
    fontStyleCount: fontLineItemCount,
    unitPrice,
    subtotal,
    percentageDiscount,
    totalDiscount,
    total,
  } = summary

  return (
    <Box pos={'relative'}>
      <Box
        maxW={['100%']}
        ml={{ base: '1rem', xl: '15rem', '3xl': '21rem' }}
        mr={{
          base: '1rem',
          lg: '15rem',
          xl: '15rem',
          '2xl': '17rem',
          '3xl': '21rem',
        }}
        position={'relative'}
      >
        <SimpleGrid columns={2} gap={[4, null, null, null, null, null, 8]}>
          <GridItem colSpan={2}>
            <LicenseOwnerRadio
              label={buyLabels?.licenseHolder?.label}
              info={buyLabels?.licenseHolder?.info}
            />
          </GridItem>
          <GridItem colSpan={{ base: 2, md: 1, '2xl': 1 }}>
            <LicenseSizeList
              label={buyLabels?.companySize?.label}
              info={buyLabels?.companySize?.info}
              setLicenseSize={setLicenseSize}
              licenseSize={licenseSize}
            />
          </GridItem>
          <GridItem colSpan={{ base: 2, md: 1, '2xl': 1 }}>
            <LicenseTypeList
              label={buyLabels?.licenseType?.label}
              info={buyLabels?.licenseType?.info}
              font={font}
              skuOptions={skuOptions}
              selectedSkuOptions={selectedSkuOptions}
              setSelectedSkuOptions={setSelectedSkuOptions}
            />
          </GridItem>
          <GridItem colSpan={2}>
            <Fieldset.Root>
              <FieldsetLegend>
                {buyLabels?.fonts?.label || '4. Typefaces'}
              </FieldsetLegend>
              <Fieldset.Content
                p={0}
                m={0}
                pos={'relative'}
                pointerEvents={
                  allLicenseInfoSet && !isCreatingOrder ? 'auto' : 'none'
                }
                opacity={allLicenseInfoSet ? 1 : 0.3}
              >
                <Typefaces />
              </Fieldset.Content>
            </Fieldset.Root>
          </GridItem>
        </SimpleGrid>
        {(isCreatingOrder || isCommitting) && (
          <Flex
            pos={'absolute'}
            inset={0}
            align={'center'}
            justify={'center'}
            bg={'whiteAlpha.700'}
            zIndex={1}
          >
            <Spinner size={'lg'} />
          </Flex>
        )}
      </Box>
      <Show when={show}>
        <VStack
          pos={{ base: 'relative', lg: 'fixed' }}
          right={{ base: 'auto', lg: '1rem', '3xl': '2rem' }}
          top={{ base: 'auto', lg: 5 }}
          w={{ base: '100%', lg: '13rem', '2xl': '15rem', '3xl': '17rem' }}
          bg={'#FFF8D3'}
          px={4}
          py={5}
          my={{ base: 4, xl: 0 }}
          borderRadius={20}
          gap={2}
        >
          <Flex
            w={'full'}
            justifyContent={'space-between'}
            borderBottom={'1px solid #CEC9AB'}
            alignItems={'center'}
            pb={2}
          >
            <Text
              textStyle={{ base: 'md', xl: 'sm', '2xl': 'md' }}
              w={'50%'}
              textTransform={'uppercase'}
            >
              {'Summary'}
            </Text>
            {groupIsCommitted ? (
              <Button
                asChild
                variant={'solid'}
                bg={'black'}
                borderRadius={'5rem'}
                size={'sm'}
                fontSize={'md'}
                color={'white'}
                gap={1}
                _hover={{ bg: 'red' }}
              >
                <Link href={'/cart/'}>{'Go to cart'}</Link>
              </Button>
            ) : (
              <Button
                variant={'solid'}
                bg={'red'}
                borderRadius={'5rem'}
                size={'sm'}
                fontSize={'md'}
                color={'white'}
                disabled={!allLicenseInfoSet || isCommitting}
                gap={1}
                _hover={{ bg: 'black' }}
                onClick={async () => {
                  setIsCommitting(true)
                  try {
                    await commitGroup(fontUid)
                  } catch (e) {
                    console.error('[Buy] commitGroup error:', e)
                  } finally {
                    setIsCommitting(false)
                  }
                }}
              >
                {isCommitting ? (
                  <>
                    <Spinner size={'xs'} /> {'Adding...'}
                  </>
                ) : (
                  'Add to cart'
                )}
              </Button>
            )}
          </Flex>
          <Flex
            w={'full'}
            justifyContent={'space-between'}
            borderBottom={'1px solid #CEC9AB'}
            alignItems={'center'}
            pb={2}
          >
            <Text textStyle={{ base: 'md', xl: 'sm', '2xl': 'md' }} w={'50%'}>
              {' '}
              {`Styles`}
            </Text>
            <Text
              pl={1}
              textStyle={{ base: 'md', xl: 'sm', '2xl': 'md' }}
            >{`${fontLineItemCount}`}</Text>
          </Flex>
          <Flex
            w={'full'}
            justifyContent={'space-between'}
            borderBottom={'1px solid #CEC9AB'}
            alignItems={'center'}
            pb={2}
          >
            <Text textStyle={{ base: 'md', xl: 'sm', '2xl': 'md' }} w={'50%'}>
              {' '}
              {`Licenses`}
            </Text>
            <Text
              pl={1}
              textStyle={{ base: 'md', xl: 'sm', '2xl': 'md' }}
            >{`${licensesCount}`}</Text>
          </Flex>
          <Flex
            w={'full'}
            justifyContent={'space-between'}
            borderBottom={'1px solid #CEC9AB'}
            alignItems={'center'}
            pb={2}
          >
            <Text textStyle={{ base: 'md', xl: 'sm', '2xl': 'md' }} w={'50%'}>
              {' '}
              {`Unit Price`}
            </Text>
            <Text
              pl={1}
              textStyle={{ base: 'md', xl: 'sm', '2xl': 'md' }}
            >{`${unitPrice} EUR`}</Text>
          </Flex>
          <Flex
            w={'full'}
            justifyContent={'space-between'}
            borderBottom={'1px solid #CEC9AB'}
            alignItems={'center'}
            pb={2}
          >
            <Text textStyle={{ base: 'md', xl: 'sm', '2xl': 'md' }} w={'50%'}>
              {' '}
              {`Subtotal`}
            </Text>
            <Text
              pl={1}
              textStyle={{ base: 'md', xl: 'sm', '2xl': 'md' }}
            >{`${subtotal} EUR`}</Text>
          </Flex>
          <Show when={totalDiscount > 0}>
            <Flex
              w={'full'}
              justifyContent={'space-between'}
              borderBottom={'1px solid #CEC9AB'}
              alignItems={'center'}
              pb={2}
            >
              <Text
                textStyle={{ base: 'md', xl: 'sm', '2xl': 'md' }}
                w={'50%'}
                whiteSpace={'nowrap'}
              >
                {`Discount (${percentageDiscount * 100}%)`}
              </Text>
              <Text
                pl={1}
                textStyle={{ base: 'md', xl: 'sm', '2xl': 'md' }}
              >{`-${totalDiscount} EUR`}</Text>
            </Flex>
          </Show>
          <Flex
            w={'full'}
            mt={-1}
            justifyContent={'space-between'}
            borderTop={'1px solid #CEC9AB'}
            alignItems={'center'}
            pt={2}
          >
            <Text
              textStyle={{ base: 'md', xl: 'sm', '2xl': 'md' }}
              w={'50%'}
              textTransform={'uppercase'}
            >
              {`TOTAL`}
            </Text>
            <Text pl={1} textStyle={'md'}>{`${total} EUR`}</Text>
          </Flex>
        </VStack>
      </Show>
    </Box>
  )
}

export default Buy
