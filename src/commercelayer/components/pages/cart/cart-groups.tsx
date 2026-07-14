import {
  Box,
  Button,
  IconButton as ChakraIconButton,
  HStack,
  Text,
  VStack,
} from '@chakra-ui/react'
import { CloseIcon } from '@sanity/icons'
import Link from 'next/link'
import React from 'react'

import { useOrderContext } from '@/commercelayer/providers/Order'
import type { CartBufferGroup, CartBufferItem } from '.'
import { CartItem } from './cart-item'

interface CartGroupsProps {
  groupedLineItems: CartBufferGroup[]
}

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
        <HStack gap={0.5}>
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
            <Box>{`${percentageDiscount * 100}%`}</Box>
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
            >
              <HStack gap={4}>
                <Text as={'span'} fontSize={'lg'}>
                  {discountedPriceTotal} {'EUR'}
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

const CartGroups: React.FC<CartGroupsProps> = ({ groupedLineItems }) => {
  const { toggleGroup } = useOrderContext()

  return (
    <>
      {groupedLineItems.map(
        ({
          parentUid,
          parentName,
          defaultVariantId,
          items,
          subGroups,
          hasSubGroups,
          discountedPriceTotal,
          fullUnitPriceTotal,
          percentageDiscount,
        }) => (
          <VStack gap={0.5} mb={1} key={parentUid} alignItems={'stretch'}>
            <HStack
              py={2}
              px={3}
              bg={'brand.50'}
              // bg={'colorPalette.bg'}
              // boxShadow={'inset 0 0 0 2px #000'}
              w={'full'}
              borderRadius={'full'}
            >
              <ChakraIconButton
                variant="ghost"
                rounded={'full'}
                px={0}
                size={'sm'}
                _hover={{ bg: 'white' }}
                aria-label="Remove group"
                onClick={() =>
                  toggleGroup({
                    parentUid,
                    styles: items.map((item) => ({
                      skuCode: item.skuCode,
                      styleMetadata: item.entry,
                    })),
                  })
                }
                css={{
                  '& svg': {
                    color: 'brand.600',
                  },
                }}
              >
                <CloseIcon width={'2rem'} height={'2rem'} />
              </ChakraIconButton>
              <Text
                fontSize={'2xl'}
                lineHeight={1}
                as={'div'}
                className={defaultVariantId}
              >
                {parentName}
              </Text>
            </HStack>
            {hasSubGroups
              ? subGroups.map((sg) => (
                  <React.Fragment key={sg.groupName}>
                    <Box px={3} pt={2} pb={1}>
                      <Text
                        fontSize={'xs'}
                        textTransform={'uppercase'}
                        color={'#737373'}
                      >
                        {sg.groupName}
                      </Text>
                    </Box>
                    {sg.items.map((item) => (
                      <CartItem key={item.skuCode} item={item} />
                    ))}
                  </React.Fragment>
                ))
              : items.map((item) => (
                  <CartItem key={item.skuCode} item={item} />
                ))}
            <CartGroupsFooter
              parentUid={parentUid}
              discountedPriceTotal={discountedPriceTotal}
              fullUnitPriceTotal={fullUnitPriceTotal}
              percentageDiscount={percentageDiscount}
            />
          </VStack>
        )
      )}
    </>
  )
}

export default CartGroups
