'use client'
import { Box, Button, Flex, Heading, SimpleGrid } from '@chakra-ui/react'
import { format, parseISO } from 'date-fns'
import { useMemo } from 'react'

interface LineItemType {
  id: string
  item_type?: string
  item?: {
    name?: string
    reference_origin?: string
    [key: string]: any
  }
  line_item_options?: Array<{
    name?: string
    [key: string]: any
  }>
  unit_amount_float?: number
  [key: string]: any
}

interface OrderType {
  line_items?: LineItemType[]
  total_amount_with_taxes_float?: number
  [key: string]: any
}

interface OrderSummaryProps {
  /** Order data containing line items and metadata */
  order: OrderType | null | undefined
  /** Heading text for the summary */
  heading?: string
  /** Empty state text */
  emptyText?: string
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({ order }) => {
  // Memoize line item filtering and font reference calculations
  const { fontCount } = useMemo(() => {
    if (!order?.line_items) {
      return {
        fontCount: 0,
      }
    }

    // Filter out payment method and shipping line items - only show SKUs and bundles
    const filteredItems = order.line_items.filter(
      (lineItem) =>
        lineItem.item_type === 'skus' || lineItem.item_type === 'bundles'
    )

    return {
      fontCount: filteredItems.length,
    }
  }, [order?.line_items])

  const placedAt = order?.placed_at
    ? format(parseISO(order?.placed_at), 'yyyy-MM-dd')
    : '0000-00-00'

  if (!order) {
    return null
  }

  return (
    <Box bg={'#FFF8D3'} px={4} py={3} borderRadius={20} w={'full'}>
      <SimpleGrid columns={2} fontSize={'sm'}>
        <Heading
          as={'h5'}
          fontSize={'xl'}
          textTransform={'uppercase'}
          fontWeight={'normal'}
          cursor={'pointer'}
        >
          {'Order #'}
          {order.number}
        </Heading>

        <Flex justifyContent={'flex-end'}>
          <Button
            variant="text"
            size="xs"
            // onClick={() => {}}
            fontSize="xs"
            px={2}
            py={1}
            h="auto"
            minH="auto"
          >
            {'Download invoice'}
          </Button>
          <Button
            variant="text"
            size="xs"
            // onClick={() => {}}
            fontSize="xs"
            px={2}
            py={1}
            h="auto"
            minH="auto"
          >
            {'Download fonts'}
          </Button>
        </Flex>
      </SimpleGrid>
      <Box>
        <SimpleGrid
          columns={3}
          py={3}
          borderTop={'1px solid #E7E0BF'}
          fontSize={'sm'}
        >
          <Box>{'Status'}</Box>
          <Box>{order?.status}</Box>
          <Box></Box>
        </SimpleGrid>
        <SimpleGrid
          columns={3}
          py={3}
          borderTop={'1px solid #E7E0BF'}
          fontSize={'sm'}
        >
          <Box>{'Date'}</Box>
          <Box>{placedAt}</Box>
          <Box></Box>
        </SimpleGrid>
        <SimpleGrid
          columns={3}
          py={3}
          borderTop={'1px solid #E7E0BF'}
          borderBottom={'1px solid #E7E0BF'}
          mb={1.5}
          fontSize={'sm'}
        >
          <Box>{'Items'}</Box>
          <Box>{fontCount}</Box>
          <Box></Box>
        </SimpleGrid>
        <SimpleGrid columns={3} py={3} mt={1.5}>
          <Box
            fontSize={'xl'}
            textTransform={'uppercase'}
            fontWeight={'normal'}
          >
            {'Total'}
          </Box>
          <Box></Box>
          <Box
            fontSize={'xl'}
            textAlign={'right'}
            fontVariantNumeric={'tabular-nums'}
          >
            {`EUR ${order?.total_amount_with_taxes_float}`}
          </Box>
        </SimpleGrid>
      </Box>
    </Box>
  )
}
