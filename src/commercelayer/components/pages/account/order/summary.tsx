'use client'
import {
  computeOrderTotals,
  expandAndGroupLineItems,
  expandLineItems,
  filterShoppableItems,
} from '@/commercelayer/utils/expand-group-projections'
import {
  Box,
  Button,
  Flex,
  GridItem,
  Heading,
  IconButton,
  Menu,
  Portal,
  SimpleGrid,
} from '@chakra-ui/react'
import { EllipsisHorizontalIcon } from '@sanity/icons'
import { format, parseISO } from 'date-fns'
import { useMemo } from 'react'

interface OrderSummaryProps {
  /** Order data containing line items and metadata */
  order: any
  /** Heading text for the summary */
  heading?: string
  /** Empty state text */
  emptyText?: string
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({ order }) => {
  // Expanded style count (group projections count as N styles, not 1 line item)
  const { fontCount, subtotalAmount, totalDiscount } = useMemo(() => {
    if (!order?.line_items) {
      return {
        fontCount: 0,
        subtotalAmount: 0,
        totalDiscount: 0,
      }
    }

    const groups = expandAndGroupLineItems(order.line_items)
    const { subtotalAmount, totalDiscount } = computeOrderTotals(groups)

    const shoppable = filterShoppableItems(order.line_items)
    const expanded = expandLineItems(shoppable)

    return {
      fontCount: expanded.length,
      subtotalAmount: Math.round(subtotalAmount * 100) / 100,
      totalDiscount,
    }
  }, [order?.line_items])

  const placedAt =
    (order?.placed_at && format(parseISO(order?.placed_at), 'yyyy-MM-dd')) || ''

  if (!order) {
    return null
  }

  return (
    <Box bg={'#FFF8D3'} px={4} py={3} borderRadius={20} w={'full'}>
      <SimpleGrid columns={2} fontSize={'sm'} minH={'2rem'}>
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

        <GridItem textAlign={'right'}>
          <Menu.Root
            variant={'right'}
            size={'sm'}
            positioning={{ placement: 'bottom-end' }}
          >
            <Menu.Trigger
              asChild
              // mt={'-0.25rem'}
            >
              {/*<Button
                variant={'solid'}
                borderRadius={'full'}
                variant="outline"
                _hover={{
                  bg: 'black',
                  color: 'white',
                }}
                size="xs"
              >
                {'Download'}
              </Button>*/}
              {/*<IconButton
                borderRadius={'full'}
                variant="outline"
                _hover={{
                  bg: 'black',
                  color: 'white',
                }}
                size="sm"
              >*/}
              {/*<IconButton
                borderRadius={'full'}
                variant="ghost"
                bg={'white'}
                _hover={{
                  bg: 'black',
                  color: 'white',
                }}
                size="sm"
              >
                <EllipsisHorizontalIcon />
              </IconButton>*/}
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
                {'Download'}
              </Button>
            </Menu.Trigger>
            <Portal>
              <Menu.Positioner>
                <Menu.Content>
                  <Menu.Item asChild value={'invoice'}>
                    <Button variant={'plain'}>{'Invoice'}</Button>
                  </Menu.Item>
                  <Menu.Item value={'fonts'} asChild>
                    <Button variant={'plain'}>{'Fonts'}</Button>
                  </Menu.Item>
                </Menu.Content>
              </Menu.Positioner>
            </Portal>
          </Menu.Root>
        </GridItem>

        {/*<Flex justifyContent={'flex-end'}>
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
        </Flex>*/}
      </SimpleGrid>
      <Box>
        <SimpleGrid
          columns={3}
          py={3}
          borderTop={'1px solid #E7E0BF'}
          fontSize={'sm'}
        >
          <Box>{'Status'}</Box>
          <Box>{'Date'}</Box>
          <Box>{'Items'}</Box>
        </SimpleGrid>
        <SimpleGrid
          columns={3}
          py={3}
          borderTop={'1px solid #E7E0BF'}
          fontSize={'sm'}
          borderBottom={'1px solid #E7E0BF'}
        >
          <Box>{order?.status}</Box>

          <Box>{placedAt}</Box>
          <Box>{fontCount}</Box>
        </SimpleGrid>
        <SimpleGrid
          columns={2}
          pt={3}
          pb={2}
          mt={1.5}
          borderTop={'1px solid #E7E0BF'}
        >
          <Box fontSize={'lg'} fontWeight={'normal'}>
            {'Subtotal (excl. discounts)'}
          </Box>
          <Box
            fontSize={'lg'}
            textAlign={'right'}
            fontVariantNumeric={'tabular-nums'}
          >
            {`${subtotalAmount} EUR`}
          </Box>
        </SimpleGrid>
        {totalDiscount > 0 && (
          <SimpleGrid
            columns={2}
            pb={2}
            pt={3}
            borderTop={'1px solid #E7E0BF'}
            borderBottom={'1px solid #E7E0BF'}
          >
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
        <SimpleGrid columns={2} py={3}>
          <Box
            fontSize={'xl'}
            textTransform={'uppercase'}
            fontWeight={'normal'}
          >
            {'Total'}
          </Box>
          <Box
            fontSize={'xl'}
            textAlign={'right'}
            fontVariantNumeric={'tabular-nums'}
          >
            {`${order?.total_amount_with_taxes_float} EUR`}
          </Box>
        </SimpleGrid>
      </Box>
    </Box>
  )
}
