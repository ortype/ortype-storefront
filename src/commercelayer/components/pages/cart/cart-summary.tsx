import { useCartContext } from '@/commercelayer/providers/cart'
import { usePriceLocaleContext } from '@/commercelayer/providers/price-locale'
import {
  calculateLineItemPrice,
  formatPrice,
} from '@/commercelayer/utils/prices'
import { Box, Flex, Text, VStack } from '@chakra-ui/react'
import type { SkuOption } from '@commercelayer/sdk'
import { useMemo } from 'react'
import { CheckoutButton } from '../../ui/checkout-button'

const summaryFontSize = {
  base: 'lg',
  lg: 'md',
  xl: 'md',
  '2xl': 'md',
}

const Summary = () => {
  const { orderId, allLicenseInfoSet, selections, licenseSize, skuOptions } =
    useCartContext()
  const priceLocale = usePriceLocaleContext()

  // Compute summary totals from the selection buffer (per-style license types), in cents
  const { subtotalCents, totalDiscountCents, totalCents } = useMemo(() => {
    const parentUids = Object.keys(selections)
    if (
      parentUids.length === 0 ||
      !licenseSize?.modifier ||
      !skuOptions?.length
    ) {
      return {
        subtotalCents: null,
        totalDiscountCents: null,
        totalCents: null,
      }
    }

    let subTotalCents = 0
    let totalCents = 0

    for (const parentUid of parentUids) {
      const group = selections[parentUid]
      const skuCodes = Object.keys(group)
      const count = skuCodes.length

      for (const skuCode of skuCodes) {
        const entry = group[skuCode]
        const styleOptions = (entry.licenseTypes ?? [])
          .map((ref) => skuOptions.find((o) => o.reference === ref))
          .filter(Boolean) as SkuOption[]

        if (styleOptions.length === 0) continue

        subTotalCents += calculateLineItemPrice({
          skuOptions: styleOptions,
          sizeModifier: licenseSize.modifier,
          count: 1,
        })
        totalCents += calculateLineItemPrice({
          skuOptions: styleOptions,
          sizeModifier: licenseSize.modifier,
          count,
        })
      }
    }

    return {
      subtotalCents: subTotalCents,
      totalDiscountCents: subTotalCents - totalCents,
      totalCents,
    }
  }, [selections, licenseSize, skuOptions])

  return (
    <Box
      w={{
        base: '100%',
        lg: '16rem',
        '2xl': '17rem',
        '3xl': '18rem',
      }}
      bg={'#FFF8D3'}
      px={4}
      py={5}
      borderRadius={20}
    >
      <VStack gap={2} w={'full'}>
        <Flex
          w={'full'}
          justifyContent={'space-between'}
          borderBottom={'1px solid #CEC9AB'}
          alignItems={'center'}
          pb={2}
          h={8}
        >
          <Text
            textStyle={{
              base: 'md',
              lg: 'sm',
              xl: 'md',
            }}
            w={'50%'}
            textTransform={'uppercase'}
          >
            {'Summary'}
          </Text>
          <CheckoutButton
            orderId={orderId || ''}
            isDisabled={!allLicenseInfoSet}
          />
        </Flex>
        <Flex
          w={'full'}
          justifyContent={'space-between'}
          borderBottom={'1px solid #CEC9AB'}
          alignItems={'center'}
          pb={2}
        >
          <Text as={'span'} textStyle={summaryFontSize} w={'50%'}>
            {'Subtotal'}
          </Text>
          <Text as={'span'} pl={1} textStyle={summaryFontSize}>
            {subtotalCents === null
              ? '––'
              : formatPrice(subtotalCents, priceLocale)}
          </Text>
        </Flex>
        {totalDiscountCents != null && totalDiscountCents > 0 && (
          <Flex
            w={'full'}
            justifyContent={'space-between'}
            borderBottom={'1px solid #CEC9AB'}
            alignItems={'center'}
            pb={2}
          >
            <Text as={'span'} textStyle={summaryFontSize} w={'50%'}>
              {'Discounts'}
            </Text>
            <Text as={'span'} pl={1} textStyle={summaryFontSize}>
              {'-'}
              {formatPrice(totalDiscountCents, priceLocale)}
            </Text>
          </Flex>
        )}
        <Flex
          w={'full'}
          justifyContent={'space-between'}
          mt={-1}
          pt={2}
          borderTop={'1px solid #CEC9AB'}
          alignItems={'center'}
        >
          <Text as={'span'} textStyle={summaryFontSize} w={'50%'}>
            {'Total EUR'}
          </Text>
          <Text
            as={'span'}
            pl={1}
            fontFamily={'Alltaf-Var'}
            fontWeight={500}
            textStyle={summaryFontSize}
          >
            {totalCents === null
              ? '––'
              : formatPrice(totalCents, priceLocale)}
          </Text>
        </Flex>
      </VStack>
    </Box>
  )
}

export default Summary
