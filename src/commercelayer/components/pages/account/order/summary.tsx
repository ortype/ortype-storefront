'use client'
import { usePriceLocaleContext } from '@/commercelayer/providers/price-locale'
import {
  computeOrderTotals,
  expandAndGroupLineItems,
  expandLineItems,
  filterShoppableItems,
} from '@/commercelayer/utils/expand-group-projections'
import { formatPrice } from '@/commercelayer/utils/prices'
import {
  Box,
  Button,
  Flex,
  GridItem,
  Heading,
  HStack,
  Menu,
  Portal,
  SimpleGrid,
  Text,
} from '@chakra-ui/react'
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
  const priceLocale = usePriceLocaleContext()
  // Expanded style count (group projections count as N styles, not 1 line item)
  const { fontCount, subtotalCents, totalDiscountCents } = useMemo(() => {
    if (!order?.line_items) {
      return {
        fontCount: 0,
        subtotalCents: 0,
        totalDiscountCents: 0,
      }
    }

    const groups = expandAndGroupLineItems(order.line_items)
    const { subtotalCents, totalDiscountCents } = computeOrderTotals(groups)

    const shoppable = filterShoppableItems(order.line_items)
    const expanded = expandLineItems(shoppable)

    return {
      fontCount: expanded.length,
      subtotalCents,
      totalDiscountCents,
    }
  }, [order?.line_items])

  const placedAt =
    (order?.placed_at && format(parseISO(order?.placed_at), 'yyyy-MM-dd')) ||
    ''

  const placedAtLong =
    (order?.placed_at &&
      format(parseISO(order?.placed_at), 'MMMM d, yyyy')) ||
    ''

  if (!order) {
    return null
  }

  return (
    <Box bg={'#FFF8D3'} px={10} pt={4} pb={8} borderRadius={'4xl'} w={'full'}>
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
          {/*<Menu.Root
            variant={'outline'}
            size={'xs'}
            // positioning={{ placement: 'bottom-end' }}
          >
            <Menu.Trigger
              asChild
              // mt={'-0.25rem'}
            >
              <Button
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
                <Icon symbol={'ellipsis-horizontal'} />
              </IconButton>
              <Button
                variant='text'
                size='xs'
                // onClick={() => {}}
                fontSize='xs'
                px={2}
                py={1}
                h='auto'
                minH='auto'
              >
                {'Download'}
              </Button>
            </Menu.Trigger>
            <Portal>
              <Menu.Positioner>
                <Menu.Content>
                  <Menu.Item value={'invoice'}>{'Invoice'}</Menu.Item>
                  <Menu.Item value={'fonts'}>{'Fonts'}</Menu.Item>
                </Menu.Content>
              </Menu.Positioner>
            </Portal>
          </Menu.Root>*/}
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
          py={2}
          borderTop={'1px solid #E7E0BF'}
          fontSize={'sm'}
          textTransform={'uppercase'}
        >
          <Box>{'Status'}</Box>
          <Box>{'Date'}</Box>
          <Box>{'Items'}</Box>
        </SimpleGrid>
        <SimpleGrid
          columns={3}
          py={2}
          borderTop={'1px solid #E7E0BF'}
          fontSize={'sm'}
          borderBottom={'1px solid #E7E0BF'}
        >
          <Box>{order?.status}</Box>

          <Box>{placedAt}</Box>
          <Box>{fontCount}</Box>
        </SimpleGrid>
        {/*<SimpleGrid
          columns={2}
          pt={3}
          pb={2}
          mt={1.5}
          borderTop={'1px solid #E7E0BF'}
        >
          <Box fontSize={'lg'} fontWeight={'normal'}>
            {'Subtotal (excl. discounts)'}
          </Box>
          <Box fontSize={'lg'} textAlign={'right'}>
            {formatPrice(subtotalCents, priceLocale)}
          </Box>
        </SimpleGrid>
        {totalDiscountCents > 0 && (
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
            <Box fontSize={'lg'} textAlign={'right'}>
              {'-'}
              {formatPrice(totalDiscountCents, priceLocale)}
            </Box>
          </SimpleGrid>
        )}*/}
        <HStack
          pt={4}
          mt={1}
          pb={2}
          gap={8}
          w={'full'}
          alignItems={'flex-end'}
          justifyContent={'flex-end'}
          borderTop={'1px solid #E7E0BF'}
        >
          <Text
            as={'span'}
            fontSize={'sm'}
            lineHeight={0.6}
            textTransform={'uppercase'}
          >
            {'Total amount'}
          </Text>
          <Text
            as={'span'}
            fontSize={'xl'}
            fontWeight={500}
            textAlign={'right'}
          >
            {order && (
              <>
                {formatPrice(
                  order.total_amount_with_taxes_cents,
                  priceLocale
                )}
                {' EUR'}
              </>
            )}
          </Text>
        </HStack>
        <Flex w={'full'} justifyContent={'flex-end'}>
          <Text
            as={'span'}
            fontSize={'xs'}
            color={'#737373'}
          >{`Paid at ${placedAtLong} with VISA -4898`}</Text>
        </Flex>
      </Box>
    </Box>
  )
}
