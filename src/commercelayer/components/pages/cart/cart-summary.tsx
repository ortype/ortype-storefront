import { useOrderContext } from '@/commercelayer/providers/Order'
import { usePriceLocaleContext } from '@/commercelayer/providers/price-locale'
import {
  calculateLineItemPrice,
  formatPrice,
} from '@/commercelayer/utils/prices'
import { Box, Flex, Heading, SimpleGrid } from '@chakra-ui/react'
import type { SkuOption } from '@commercelayer/sdk'
import { useMemo } from 'react'

const summaryFontSize = {
  base: 'lg',
  lg: 'md',
  xl: 'md',
  '2xl': 'md',
}

const Summary = () => {
  const { selections, licenseSize, skuOptions } = useOrderContext()
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
      <Heading
        as={'h5'}
        fontSize={'md'}
        textTransform={'uppercase'}
        fontWeight={'normal'}
        pb={2}
      >
        {'Summary'}
      </Heading>
      <Box mb={1} borderBottom={'1px solid #CEC9AB'}></Box>
      <SimpleGrid
        columns={2}
        py={2}
        // borderTop={'1px solid #CEC9AB'}
        borderBottom={'1px solid #CEC9AB'}
      >
        <Box textStyle={summaryFontSize} fontWeight={'normal'}>
          {'Subtotal'}
        </Box>
        <Box textStyle={summaryFontSize} textAlign={'right'}>
          {subtotalCents === null
            ? '––'
            : formatPrice(subtotalCents, priceLocale)}
        </Box>
      </SimpleGrid>
      {totalDiscountCents != null && totalDiscountCents > 0 && (
        <SimpleGrid columns={2} py={2} borderBottom={'1px solid #CEC9AB'}>
          <Box textStyle={summaryFontSize} fontWeight={'normal'}>
            {'Discounts'}
          </Box>
          <Box textStyle={summaryFontSize} textAlign={'right'}>
            {'-'}
            {formatPrice(totalDiscountCents, priceLocale)}
          </Box>
        </SimpleGrid>
      )}
      <SimpleGrid
        columns={2}
        py={2}
        borderBottom={'1px solid #CEC9AB'}
        fontFamily={'Alltaf-Var'}
        fontWeight={500}
      >
        <Box
          textStyle={summaryFontSize}
          textTransform={'uppercase'}
          fontWeight={'normal'}
        >
          {'Total EUR'}
        </Box>
        <Box textStyle={summaryFontSize} textAlign={'right'}>
          {totalCents === null ? '––' : formatPrice(totalCents, priceLocale)}
        </Box>
      </SimpleGrid>
      <Box pt={1} borderBottom={'1px solid #CEC9AB'}></Box>
    </Box>
  )
}

export default Summary
