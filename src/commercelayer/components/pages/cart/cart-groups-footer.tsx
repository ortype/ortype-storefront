import { Box, Button, HStack, Text, VStack } from '@chakra-ui/react'
import Link from 'next/link'
import React from 'react'

interface CartGroupsFooterProps {
  parentUid: string
  discountedPriceTotal: number
  fullUnitPriceTotal: number
  percentageDiscount: number
}

const CartGroupsFooter: React.FC<CartGroupsFooterProps> = ({
  parentUid,
  discountedPriceTotal,
  fullUnitPriceTotal,
  percentageDiscount,
}) => {
  return (
    <HStack
      justifyContent={'space-between'}
      alignItems={'flex-start'}
      mb={4}
      pt={2}
      mt={-0.5}
    >
      <HStack alignItems={'center'}>
        <Button
          asChild
          variant={'outline'}
          bg={'white'}
          borderRadius={'5rem'}
          size={'xs'}
          fontSize={'md'}
          _hover={{
            bg: 'black',
            color: 'white',
          }}
        >
          <Link href={`/cart/buy/${parentUid}`}>{'Add More Styles'}</Link>
        </Button>
        {percentageDiscount === 0 && (
          <Text as={Box} textAlign={'center'} textStyle={'xs'} opacity={0.8}>
            {`Choose more styles to unlock bundle discounts.`}
          </Text>
        )}
      </HStack>

      {percentageDiscount === 0 ? (
        <Box
          bg={'#FFF8D3'}
          borderRadius={30}
          py={4}
          px={6}
          fontSize={'xl'}
        >{`${fullUnitPriceTotal} EUR`}</Box>
      ) : (
        // DISCOUNT
        <HStack gap={0.5} alignItems={'stretch'}>
          <VStack
            bg={'#FFF8D3'}
            borderRadius={30}
            borderTopRightRadius={0}
            borderBottomRightRadius={0}
            p={4}
            gap={0}
            fontSize={'xl'}
            lineHeight={0.9}
          >
            <Box>{`${percentageDiscount}%`}</Box>
            <Box>{'OFF'}</Box>
          </VStack>
          <Box
            bg={'#FFF8D3'}
            borderRadius={30}
            borderTopLeftRadius={0}
            borderBottomLeftRadius={0}
            p={5}
          >
            <VStack
              gap={1.5}
              alignItems={'flex-end'}
              fontVariantNumeric={'tabular-nums'}
              pr={2}
              whiteSpace={'nowrap'}
              flex={'1 0 0'}
            >
              <HStack gap={4}>
                <Text as={'span'} fontSize={'lg'}>
                  {discountedPriceTotal === 0
                    ? `–– EUR`
                    : `${discountedPriceTotal} EUR`}
                </Text>
              </HStack>
              {discountedPriceTotal !== fullUnitPriceTotal && (
                <Text
                  as={'span'}
                  textDecoration={'line-through'}
                  fontSize={'lg'}
                  color={'brand.400'}
                >
                  {fullUnitPriceTotal} {'EUR'}
                </Text>
              )}
            </VStack>
          </Box>
        </HStack>
      )}
    </HStack>
  )
}

export default CartGroupsFooter
