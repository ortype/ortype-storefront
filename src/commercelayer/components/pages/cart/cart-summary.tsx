import { useOrderContext } from '@/commercelayer/providers/Order'
import { usePriceLocaleContext } from '@/commercelayer/providers/price-locale'
import {
  calculateLineItemPrice,
  formatPriceWithSuperscript,
} from '@/commercelayer/utils/prices'
import { Box, Flex, Heading, SimpleGrid } from '@chakra-ui/react'
import type { SkuOption } from '@commercelayer/sdk'
import { useMemo } from 'react'

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
    <Flex justifyContent={'flex-end'} w={'full'}>
      <Box
        bg={'#FFF8D3'}
        px={4}
        pt={5}
        pb={6}
        borderRadius={30}
        w={{ base: 'full', md: '50%' }}
      >
        <Heading
          as={'h5'}
          fontSize={'xl'}
          textTransform={'uppercase'}
          fontWeight={'normal'}
          pb={2}
        >
          {'Cart Summary'}
        </Heading>
        <Box mb={1} borderBottom={'1px solid #CEC9AB'}></Box>
        <SimpleGrid
          columns={2}
          py={3}
          borderTop={'1px solid #CEC9AB'}
          borderBottom={'1px solid #CEC9AB'}
        >
          <Box fontSize={'lg'} fontWeight={'normal'}>
            {'Subtotal (excl. discounts)'}
          </Box>
          <Box fontSize={'lg'} textAlign={'right'}>
            {subtotalCents === null
              ? '––'
              : formatPriceWithSuperscript(subtotalCents, priceLocale)}
          </Box>
        </SimpleGrid>
        {totalDiscountCents != null && totalDiscountCents > 0 && (
          <SimpleGrid columns={2} py={3} borderBottom={'1px solid #CEC9AB'}>
            <Box fontSize={'lg'} fontWeight={'normal'}>
              {'Discounts'}
            </Box>
            <Box fontSize={'lg'} textAlign={'right'}>
              {'-'}
              {formatPriceWithSuperscript(totalDiscountCents, priceLocale)}
            </Box>
          </SimpleGrid>
        )}
        <SimpleGrid
          columns={2}
          py={3}
          borderBottom={'1px solid #CEC9AB'}
          fontFamily={'Alltaf-Var'}
          fontWeight={500}
        >
          <Box
            fontSize={'lg'}
            textTransform={'uppercase'}
            fontWeight={'normal'}
          >
            {'Total EUR'}
          </Box>
          <Box fontSize={'lg'} textAlign={'right'}>
            {totalCents === null
              ? '––'
              : formatPriceWithSuperscript(totalCents, priceLocale)}
          </Box>
        </SimpleGrid>
        <Box pt={1} borderBottom={'1px solid #CEC9AB'}></Box>
      </Box>
    </Flex>
  )
}

export default Summary
