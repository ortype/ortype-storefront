import {
  Box,
  Button,
  Flex,
  Heading,
  SimpleGrid,
  Stack,
  Text,
  VStack,
} from '@chakra-ui/react'
import { type LineItem, type SkuOption } from '@commercelayer/sdk'
import React, { useMemo } from 'react'

interface FontLicensesProps {
  order: any
}

interface LineItemProps {
  lineItem: LineItem
}

const LineItem: React.FC<LineItemProps> = ({ lineItem }) => {
  const selectedSkuOptions = lineItem.line_item_options?.map(
    ({ sku_option }) => sku_option
  )

  return (
    <>
      <SimpleGrid columns={[1, null, 2]} gap={3} bg={'brand.50'} p={3}>
        <Stack direction={'row'} gap={2} alignItems={'center'}>
          <Text fontSize={'2xl'} as={'span'} className={lineItem.sku_code}>
            {lineItem.name}
          </Text>
        </Stack>
        <Flex direction={'row'} px={3} alignItems={'center'} gap={2}>
          {selectedSkuOptions?.map(({ id, name }) => (
            <Box key={id} bg={'#fff'} p={2} fontSize={'lg'}>
              {name}
            </Box>
          ))}
        </Flex>
      </SimpleGrid>
    </>
  )
}

export const FontLicenses: React.FC<FontLicensesProps> = ({ order }) => {
  // Memoize line item filtering and font reference calculations
  const { displayLineItems } = useMemo(() => {
    if (!order?.line_items) {
      return {
        displayLineItems: [],
      }
    }

    // Filter out payment method and shipping line items - only show SKUs and bundles
    const filteredItems = order.line_items.filter(
      (lineItem) =>
        lineItem.item_type === 'skus' || lineItem.item_type === 'bundles'
    )

    // Expand group projection line items into virtual per-style entries
    const expanded: LineItem[] = []
    for (const item of filteredItems) {
      if (item.metadata?.projectionType === 'group') {
        const styleNames: string[] = item.metadata?.includedStyleNames ?? []
        const skuCodes: string[] = item.metadata?.includedSkuCodes ?? []
        const perStyleTypes: Record<string, string[]> =
          item.metadata?.license?.perStyleTypes ?? {}
        for (let i = 0; i < skuCodes.length; i++) {
          expanded.push({
            ...item,
            id: `${item.id}-${i}`,
            name: styleNames[i] ?? skuCodes[i],
            sku_code: skuCodes[i],
            // Synthesize line_item_options from perStyleTypes for display
            line_item_options: (perStyleTypes[skuCodes[i]] ?? []).map(
              (ref, j) => ({
                id: `${item.id}-opt-${i}-${j}`,
                name: ref,
                quantity: 1,
              })
            ) as any,
          } as LineItem)
        }
      } else {
        expanded.push(item)
      }
    }

    return {
      displayLineItems: expanded,
    }
  }, [order?.line_items])

  return (
    <VStack gap={2} w={'full'} alignItems={'flex-start'}>
      {/*<Heading
        as={'h5'}
        fontSize={'xl'}
        textTransform={'uppercase'}
        fontWeight={'normal'}
      >
        {'Font licenses'}
      </Heading>*/}
      <SimpleGrid columns={2} gap={4} w={'full'}>
        <Box
          px={3}
          fontSize={'xs'}
          textTransform={'uppercase'}
          color={'#737373'}
          asChild
        >
          <Flex gap={1} alignItems={'center'}>
            {'Fonts'}
          </Flex>
        </Box>
        <Box
          px={3}
          fontSize={'xs'}
          textTransform={'uppercase'}
          color={'#737373'}
          asChild
        >
          <Flex gap={1} alignItems={'center'}>
            {'License Type'}
          </Flex>
        </Box>
      </SimpleGrid>
      <Stack gap={2} w={'full'}>
        {displayLineItems.map((lineItem) => (
          <LineItem key={lineItem.id} lineItem={lineItem} />
        ))}
      </Stack>
      {/*<Button
        variant={'outline'}
        bg={'white'}
        borderRadius={'5rem'}
        size={'sm'}
        fontSize={'md'}
      >
        {'Download fonts'}
      </Button>*/}
    </VStack>
  )
}
