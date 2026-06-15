import { useOrderContext } from '@/commercelayer/providers/Order'
import {
  calculateLineItemPrice,
  formatPrice,
} from '@/commercelayer/utils/prices'
import { Box, Flex, Heading, SimpleGrid } from '@chakra-ui/react'
import type { SkuOption } from '@commercelayer/sdk'
import { useMemo } from 'react'

const Summary = () => {
  const { selections, licenseSize, skuOptions } = useOrderContext()

  // Compute summary totals from the selection buffer (per-style license types)
  const { subtotal, totalDiscount, total } = useMemo(() => {
    const parentUids = Object.keys(selections)
    if (
      parentUids.length === 0 ||
      !licenseSize?.modifier ||
      !skuOptions?.length
    ) {
      return { subtotal: null, totalDiscount: null, total: null }
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
      subtotal: formatPrice(subTotalCents),
      totalDiscount: formatPrice(subTotalCents - totalCents),
      total: formatPrice(totalCents),
    }
  }, [selections, licenseSize, skuOptions])
  const displayTotal = total

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
          <Box
            fontSize={'lg'}
            textAlign={'right'}
            fontVariantNumeric={'tabular-nums'}
          >
            {`${subtotal} EUR`}
          </Box>
        </SimpleGrid>
        {totalDiscount && totalDiscount > 0 && (
          <SimpleGrid columns={2} py={3} borderBottom={'1px solid #CEC9AB'}>
            <Box fontSize={'lg'} fontWeight={'normal'}>
              {'Discounts'}
            </Box>
            <Box
              fontSize={'lg'}
              textAlign={'right'}
              fontVariantNumeric={'tabular-nums'}
            >
              {`-${totalDiscount} EUR`}
            </Box>
          </SimpleGrid>
        )}
        <SimpleGrid
          columns={2}
          py={3}
          borderBottom={'1px solid #CEC9AB'}
          fontFamily={'Alltaf-Bold'}
        >
          <Box
            fontSize={'lg'}
            textTransform={'uppercase'}
            fontWeight={'normal'}
          >
            {'Total'}
          </Box>
          <Box
            fontSize={'lg'}
            textAlign={'right'}
            fontVariantNumeric={'tabular-nums'}
          >
            {`${displayTotal} EUR`}
          </Box>
        </SimpleGrid>
        <Box pt={1} borderBottom={'1px solid #CEC9AB'}></Box>
      </Box>
    </Flex>
  )
}

export default Summary
