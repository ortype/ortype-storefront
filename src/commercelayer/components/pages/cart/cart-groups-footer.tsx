'use client'

import { useCartContext } from '@/commercelayer/providers/cart'
import { usePriceLocaleContext } from '@/commercelayer/providers/price-locale'
import { formatPrice } from '@/commercelayer/utils/prices'
import { Box, Button, HStack, Text, VStack } from '@chakra-ui/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

interface CartGroupsFooterProps {
  parentUid: string
  discountedPriceTotalCents: number
  fullUnitPriceTotalCents: number
  percentageDiscount: number
}

const CartGroupsFooter: React.FC<CartGroupsFooterProps> = ({
  parentUid,
  discountedPriceTotalCents,
  fullUnitPriceTotalCents,
  percentageDiscount,
}) => {
  const priceLocale = usePriceLocaleContext()
  const router = useRouter()
  const { isDirty, isSaving, save } = useCartContext()
  const [isLeaving, setIsLeaving] = useState(false)
  const href = `/cart/buy/${parentUid}`

  // The buy dialog seeds its draft from the saved order, and the user may
  // leave /cart from inside it (discarding unsaved edits). So opening it first
  // saves EVERY dirty font. Clean cart: the link behaves normally.
  const handleClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!isDirty && !isSaving) return
    e.preventDefault()
    if (isLeaving) return

    // Modified clicks (cmd/ctrl/shift/alt, middle click) also save first, then
    // open buy in a new tab. The tab is opened synchronously, inside the click
    // gesture, so popup blockers allow it; it is pointed at buy after the save.
    const isModified =
      e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey
    const newTab = isModified ? window.open('', '_blank') : null

    setIsLeaving(true)
    try {
      const result = await save()
      if (!result.success) {
        // Stay on the cart; the action bar shows the error
        newTab?.close()
        return
      }
      if (newTab) {
        newTab.location.href = new URL(
          href,
          window.location.origin
        ).toString()
      } else {
        router.push(href)
      }
    } finally {
      setIsLeaving(false)
    }
  }

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
          <Link
            href={href}
            onClick={handleClick}
            onAuxClick={(e) => {
              // Middle click does not fire `onClick`
              if (e.button === 1) void handleClick(e)
            }}
          >
            {isLeaving ? 'Saving…' : 'Add More Styles'}
          </Link>
        </Button>
        {percentageDiscount === 0 && (
          <Text as={Box} textAlign={'center'} textStyle={'xs'} opacity={0.8}>
            {`Choose more styles to unlock bundle discounts.`}
          </Text>
        )}
      </HStack>

      {percentageDiscount === 0 ? (
        <Box bg={'#FFF8D3'} borderRadius={30} py={4} px={6} fontSize={'xl'}>
          {formatPrice(fullUnitPriceTotalCents, priceLocale)} EUR
        </Box>
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
              pr={2}
              whiteSpace={'nowrap'}
              flex={'1 0 0'}
            >
              <HStack gap={4}>
                <Text as={'span'} fontSize={'lg'}>
                  {discountedPriceTotalCents === 0 ? (
                    '–– EUR'
                  ) : (
                    <>
                      {formatPrice(discountedPriceTotalCents, priceLocale)}{' '}
                      EUR
                    </>
                  )}
                </Text>
              </HStack>
              {discountedPriceTotalCents !== fullUnitPriceTotalCents && (
                <Text
                  as={'span'}
                  textDecoration={'line-through'}
                  fontSize={'lg'}
                  color={'brand.400'}
                >
                  {formatPrice(fullUnitPriceTotalCents, priceLocale)} {'EUR'}
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
