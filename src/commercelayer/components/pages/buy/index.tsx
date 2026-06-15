import LicenseOwnerInput from '@/commercelayer/components/forms/LicenseOwnerInput'
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
  Text,
  VStack,
} from '@chakra-ui/react'
import Link from 'next/link'
import React from 'react'
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
    buyLabels,
  } = useOrderContext()
  const { font, summary } = useBuyContext()

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

  // @TODO: on changing selected SKU options, update all line_items on the order

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
            <LicenseOwnerInput
              label={buyLabels?.licenseOwner?.label}
              info={buyLabels?.licenseOwner?.info}
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
            <Text
              as={Box}
              py={4}
              textAlign={'center'}
              textStyle={'xs'}
              opacity={0.8}
            >
              {`Need something else? Please `}
              <ChakraLink
                href="mailto:info@ortype.is"
                textDecoration={'underline'}
                target={'_blank'}
              >
                {'contact us'}
              </ChakraLink>
              {`.`}
            </Text>
          </GridItem>
          <GridItem colSpan={{ base: 2, md: 1, '2xl': 1 }}>
            <LicenseSizeList
              label={buyLabels?.companySize?.label}
              info={buyLabels?.companySize?.info}
              setLicenseSize={setLicenseSize}
              licenseSize={licenseSize}
            />
          </GridItem>
          <GridItem colSpan={2}>
            <Fieldset.Root>
              <FieldsetLegend>
                {buyLabels?.fonts?.label || '4. Typefaces'}
              </FieldsetLegend>
              <Fieldset.Content
                asChild
                p={0}
                pointerEvents={allLicenseInfoSet ? 'auto' : 'none'}
                opacity={allLicenseInfoSet ? 1 : 0.3}
              >
                <Typefaces />
              </Fieldset.Content>
            </Fieldset.Root>
          </GridItem>
        </SimpleGrid>
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
            <Button
              asChild
              variant={'solid'}
              bg={'red'}
              borderRadius={'5rem'}
              size={'sm'}
              fontSize={'md'}
              color={'white'}
              disabled={!allLicenseInfoSet}
              gap={1}
              _hover={{ bg: 'black' }}
            >
              <Link href={'/cart/'}>{'Go to cart'}</Link>
            </Button>
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
