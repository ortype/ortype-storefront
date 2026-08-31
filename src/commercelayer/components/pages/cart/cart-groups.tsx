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
import CartGroupsFooter from './cart-groups-footer'
import { CartItem } from './cart-item'

interface CartGroupsProps {
  groupedLineItems: CartBufferGroup[]
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
          <>
            <VStack
              gap={0.5}
              mb={1}
              key={parentUid}
              alignItems={'stretch'}
              pos={'relative'}
            >
              <HStack
                py={2}
                px={2}
                gap={2}
                bg={'brand.50'}
                w={'full'}
                borderRadius={'full'}
              >
                <ChakraIconButton
                  variant='ghost'
                  rounded={'full'}
                  px={0}
                  size={'sm'}
                  _hover={{ bg: 'white' }}
                  aria-label='Remove group'
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
                  ml={1}
                  as={'div'}
                  className={defaultVariantId}
                >
                  {parentName}
                </Text>
              </HStack>
              {hasSubGroups ? (
                subGroups.map((sg) => (
                  <React.Fragment key={sg.groupName}>
                    <Flex
                      px={3}
                      pt={2}
                      gap={0.5}
                      minH={7}
                      justifyContent={'flex-start'}
                      alignItems={'center'}
                    >
                      <Text
                        as={'span'}
                        fontSize={'sm'}
                        ml={10}
                        pl={0.5}
                        // ml={7}
                        textTransform={'uppercase'}
                        color={'#737373'}
                      >
                        {sg.groupName}
                      </Text>
                      {/*sg.allSelected && (
                        <ChakraIconButton
                          // left={3}
                          // position={'absolute'}
                          // top={'50%'}
                          // transform={'translateY(-2rem)'}
                          minW={'1.5rem'}
                          maxH={'1.5rem'}
                          variant="ghost"
                          rounded={'full'}
                          // border={'2px solid #D6D5D5'}
                          px={0}
                          size={'xs'}
                          bg={'white'}
                          _hover={{ bg: '#D6D5D5', borderColor: '#D6D5D5' }}
                          aria-label="Remove group"
                          onClick={() =>
                            toggleGroup({
                              parentUid,
                              styles: sg.items.map((item) => ({
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
                      )*/}
                    </Flex>
                    <Box pos={'relative'}>
                      {sg.allSelected && (
                        <>
                          {
                            <Box
                              _before={{
                                content: '""',
                                pos: 'absolute',
                                left: 8,
                                top: -3.5,
                                w: 4,
                                // borderLeft: '2px solid #D6D5D5',
                                borderTop: '2px solid #D6D5D5',
                                // borderBottom: '2px solid #D6D5D5',
                                // borderRight: '2px solid transparent',
                                zIndex: 0,
                              }}
                            />
                          }
                          <Box
                            _before={{
                              content: '""',
                              pos: 'absolute',
                              left: 6,
                              top: -3.5,
                              bottom: 6,
                              w: 3,
                              borderLeft: '2px solid #D6D5D5',
                              borderTop: '2px solid #D6D5D5',
                              borderBottom: '2px solid #D6D5D5',
                              borderRight: '2px solid transparent',
                              zIndex: 0,
                            }}
                          />
                        </>
                      )}
                      {sg.allSelected && (
                        <ChakraIconButton
                          left={3}
                          ml={'1px'}
                          position={'absolute'}
                          // top={-6}
                          // mt={-0.25}
                          top={'50%'}
                          transform={'translateY(-2rem)'}
                          minW={'1.5rem'}
                          maxH={'1.5rem'}
                          variant='ghost'
                          rounded={'full'}
                          // border={'2px solid #D6D5D5'}
                          border={'none'}
                          px={0}
                          size={'sm'}
                          bg={'white'}
                          _hover={{
                            bg: '#D6D5D5',
                            borderColor: '#D6D5D5',
                          }}
                          aria-label='Remove group'
                          onClick={() =>
                            toggleGroup({
                              parentUid,
                              styles: sg.items.map((item) => ({
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
                      )}
                      {sg.items.map((item) => (
                        <CartItem
                          key={item.skuCode}
                          item={item}
                          allSelected={sg.allSelected}
                        />
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
                        left: 6,
                        top: 1,
                        bottom: 9,
                        w: 3,
                        borderLeft: '2px solid #D6D5D5',
                        // borderTop: '2px solid #D6D5D5',
                        borderBottom: '2px solid #D6D5D5',
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
            </VStack>
            <CartGroupsFooter
              parentUid={parentUid}
              discountedPriceTotal={discountedPriceTotal}
              fullUnitPriceTotal={fullUnitPriceTotal}
              percentageDiscount={percentageDiscount}
            />
          </>
        )
      )}
    </>
  )
}

export default CartGroups
