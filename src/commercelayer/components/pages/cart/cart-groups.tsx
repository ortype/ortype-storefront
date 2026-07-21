import {
  Box,
  Button,
  IconButton as ChakraIconButton,
  Flex,
  HStack,
  Text,
  VStack,
} from '@chakra-ui/react'
import { CloseIcon } from '@sanity/icons'
import Link from 'next/link'
import React from 'react'

import type { CartBufferGroup } from '@/commercelayer/providers/cart'
import { useCartContext } from '@/commercelayer/providers/cart'
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

const CartGroups: React.FC<CartGroupsProps> = ({ groupedLineItems }) => {
  const { toggleGroup } = useCartContext()

  return (
    <>
      {groupedLineItems.map(
        ({
          parentUid,
          parentName,
          defaultVariantId,
          items,
          subGroups,
          allSelected,
          hasSubGroups,
          discountedPriceTotal,
          fullUnitPriceTotal,
          percentageDiscount,
        }) => (
          <VStack
            gap={0.5}
            mb={1}
            key={parentUid}
            alignItems={'stretch'}
            pos={'relative'}
          >
            <Flex
              py={2}
              px={6}
              bg={'colorPalette.bg'}
              boxShadow={'inset 0 0 0 2px #000'}
              w={'full'}
              borderRadius={'full'}
              justifyContent={'space-between'}
              alignItems={'center'}
            >
              <Text
                fontSize={'2xl'}
                lineHeight={1}
                as={'div'}
                className={defaultVariantId}
              >
                {parentName}
              </Text>
              <Button
                variant="text"
                size="sm"
                onClick={() =>
                  toggleGroup({
                    parentUid,
                    styles: items.map((item) => ({
                      skuCode: item.skuCode,
                      styleMetadata: item.entry,
                    })),
                  })
                }
              >
                {'Clear'}
              </Button>
            </Flex>
            {hasSubGroups ? (
              subGroups.map((sg) => (
                <React.Fragment key={sg.groupName}>
                  <Flex
                    px={6}
                    pt={2}
                    gap={2}
                    minH={7}
                    justifyContent={'flex-start'}
                    alignItems={'center'}
                  >
                    <Text
                      as={'span'}
                      fontSize={'sm'}
                      textTransform={'uppercase'}
                      color={'#737373'}
                    >
                      {sg.groupName}
                    </Text>
                    {sg.allSelected && (
                      <Button
                        variant="text"
                        size="xs"
                        onClick={() =>
                          toggleGroup({
                            parentUid,
                            styles: sg.items.map((item) => ({
                              skuCode: item.skuCode,
                              styleMetadata: item.entry,
                            })),
                          })
                        }
                      >
                        {'Clear'}
                      </Button>
                    )}
                  </Flex>
                  <Box pos={'relative'}>
                    {sg.allSelected && (
                      <Box
                        _before={{
                          content: '""',
                          pos: 'absolute',
                          left: 2,
                          top: -4.5,
                          bottom: 6,
                          w: 3,
                          borderLeft: '2px solid #000',
                          borderTop: '2px solid #000',
                          borderBottom: '2px solid #000',
                          borderRight: '2px solid transparent',
                          zIndex: 0,
                        }}
                      />
                    )}
                    {sg.items.map((item) => (
                      <CartItem key={item.skuCode} item={item} />
                    ))}
                  </Box>
                </React.Fragment>
              ))
            ) : (
              <Box pos={'relative'}>
                {allSelected && (
                  <Box
                    _before={{
                      content: '""',
                      pos: 'absolute',
                      left: 2,
                      top: 7,
                      bottom: 7,
                      w: 3,
                      borderLeft: '2px solid #000',
                      borderTop: '2px solid #000',
                      borderBottom: '2px solid #000',
                      borderRight: '2px solid transparent',
                      zIndex: 0,
                    }}
                  />
                )}
                {items.map((item) => (
                  <CartItem key={item.skuCode} item={item} />
                ))}
              </Box>
            )}
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
