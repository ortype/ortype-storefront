'use client'

import type { CompanySize } from '@/sanity/lib/queries'
import {
  Box,
  Collapsible,
  Flex,
  Heading,
  HStack,
  Show,
  SimpleGrid,
  Text,
} from '@chakra-ui/react'
import { ChevronDownIcon, ChevronRightIcon } from '@sanity/icons'
import { motion } from 'framer-motion'
import { useMemo } from 'react'

const MotionBox = motion(Box)

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
  metadata?: {
    parentName?: string
    defaultVariantId?: string
    [key: string]: any
  }
  [key: string]: any
}

interface OrderType {
  line_items?: LineItemType[]
  metadata?: {
    license?: {
      size?: {
        value?: string
        modifier?: number
      }
    }
  }
  total_amount_with_taxes_float?: number
  [key: string]: any
}

interface FontRefCounts {
  [fontRef: string]: number
}

/** A group of line items sharing the same font family */
interface LineItemGroup {
  parentUid: string
  parentName: string
  defaultVariantId: string
  items: LineItemType[]
  groupTotal: number
}

/**
 * Count unique reference_origin values from line items
 */
export const getFontReferenceCounts = (
  lineItems: LineItemType[] = []
): FontRefCounts => {
  if (!Array.isArray(lineItems) || lineItems.length === 0) {
    return {}
  }

  const references = lineItems
    .filter((lineItem) => lineItem?.item?.reference_origin)
    .map((lineItem) => lineItem.item!.reference_origin!)
    .filter(Boolean)

  return references.reduce<FontRefCounts>((acc, ref) => {
    if (typeof ref === 'string') {
      acc[ref] = (acc[ref] || 0) + 1
    }
    return acc
  }, {})
}

/** Collapsible font family group within the order summary */
const SummaryGroup: React.FC<{ group: LineItemGroup }> = ({ group }) => {
  return (
    <Collapsible.Root>
      <Collapsible.Trigger asChild>
        <HStack
          py={1}
          cursor={'pointer'}
          _hover={{ opacity: 0.7 }}
          justifyContent={'space-between'}
          borderBottom={'1px solid #E7E0BF'}
          my={0.5}
        >
          <SimpleGrid w={'full'} columns={3} fontSize={'sm'} lineHeight={1.1}>
            <HStack gap={1}>
              <Collapsible.Context>
                {({ open }) => (
                  <Box fontSize={'md'} w={4}>
                    {open ? <ChevronDownIcon /> : <ChevronRightIcon />}
                  </Box>
                )}
              </Collapsible.Context>
              <Text
                as={'span'}
                fontSize={'xl'}
                className={group.defaultVariantId}
              >
                {group.parentName}
              </Text>
            </HStack>
            <Flex
              alignItems={'center'}
              fontSize={'sm'}
              color={'#737373'}
              pl={3}
            >
              {`${group.items.length} ${
                group.items.length === 1 ? 'style' : 'styles'
              }`}
            </Flex>
            <Flex
              alignItems={'center'}
              fontSize={'sm'}
              justifyContent={'flex-end'}
            >{`${group.groupTotal} EUR`}</Flex>
          </SimpleGrid>
        </HStack>
      </Collapsible.Trigger>
      <Collapsible.Content>
        {group.items.map((lineItem) => (
          <SimpleGrid
            key={lineItem.id}
            columns={3}
            py={1}
            pl={5}
            fontSize={'sm'}
            lineHeight={1.1}
          >
            <Box>{lineItem.name || lineItem.item?.name}</Box>
            <Box fontSize={'sm'}>
              {lineItem?.line_item_options
                ?.map((option) => option.name)
                .filter(Boolean)
                .join(', ')}
            </Box>
            <Box
              textAlign={'right'}
              fontVariantNumeric={'tabular-nums'}
            >{`${lineItem.unit_amount_float} EUR`}</Box>
          </SimpleGrid>
        ))}
      </Collapsible.Content>
    </Collapsible.Root>
  )
}

interface OrderSummaryProps {
  /** Order data containing line items and metadata */
  order: OrderType | null | undefined
  /** Whether the order has line items to display */
  hasLineItems: boolean
  /** Whether the summary box is expanded */
  isOpen: boolean
  /** Function to toggle the summary box */
  toggleBox?: () => void
  /** Heading text for the summary */
  heading?: string
  /** Empty state text */
  emptyText?: string
  /** Optional readonly flag (for future use) */
  readonly?: boolean
  sizes: CompanySize[]
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({
  order,
  hasLineItems,
  isOpen,
  toggleBox,
  heading = 'Order Overview',
  emptyText = 'Your cart is empty',
  readonly,
  sizes,
}) => {
  // Group line items by font family (reference_origin / parentUid)
  const { groups, parentFontString, subtotalAmount, totalDiscount } =
    useMemo(() => {
      if (!order?.line_items) {
        return {
          groups: [],
          parentFontString: '0 fonts',
          subtotalAmount: 0,
          totalDiscount: 0,
        }
      }

      const shoppableItems = order.line_items.filter(
        (li) => li.item_type === 'skus' || li.item_type === 'bundles'
      )

      const groupMap = new Map<string, LineItemGroup>()

      for (const item of shoppableItems) {
        const parentUid =
          item.item?.reference_origin ?? item.metadata?.parentUid ?? ''
        if (!parentUid) continue

        const existing = groupMap.get(parentUid)
        if (existing) {
          existing.items.push(item)
          existing.groupTotal += item.unit_amount_float ?? 0
        } else {
          groupMap.set(parentUid, {
            parentUid,
            parentName: item.metadata?.parentName ?? parentUid,
            defaultVariantId: item.metadata?.defaultVariantId ?? '',
            items: [item],
            groupTotal: item.unit_amount_float ?? 0,
          })
        }
      }

      const groups = Array.from(groupMap.values())
      for (const g of groups) {
        g.groupTotal = Math.round(g.groupTotal * 100) / 100
      }

      // Compute subtotal (undiscounted) from line item options + size modifier
      let subtotalAmount = 0
      let discountedTotal = 0
      const sizeModifier = order?.metadata?.license?.size?.modifier ?? 1

      for (const group of groups) {
        for (const item of group.items) {
          const optionsCents =
            item.line_item_options?.reduce(
              (total, opt) =>
                total +
                Number(opt.sku_option?.metadata?.price_amount_cents ?? 0),
              0
            ) ?? 0
          subtotalAmount += (optionsCents * sizeModifier) / 100
          discountedTotal += item.unit_amount_float ?? 0
        }
      }

      const totalDiscount =
        Math.round((subtotalAmount - discountedTotal) * 100) / 100

      const count = groups.length
      return {
        groups,
        parentFontString: count + ' ' + (count === 1 ? 'font' : 'fonts'),
        subtotalAmount: Math.round(subtotalAmount * 100) / 100,
        totalDiscount,
      }
    }, [order?.line_items, order?.metadata?.license?.size?.modifier])

  return (
    <Show
      when={hasLineItems}
      fallback={
        <Box bg={'#FFF8D3'} px={4} py={3} borderRadius={20} w={'full'}>
          <Heading
            as={'h5'}
            fontSize={'xl'}
            textTransform={'uppercase'}
            fontWeight={'normal'}
            mb={1}
          >
            {emptyText}
          </Heading>
        </Box>
      }
    >
      <Box bg={'#FFF8D3'} px={4} py={3} borderRadius={'20px'} w={'full'}>
        <Heading
          as={'h5'}
          fontSize={'xl'}
          textTransform={'uppercase'}
          fontWeight={'normal'}
          onClick={toggleBox}
          cursor={toggleBox ? 'pointer' : 'default'}
        >
          {heading}
        </Heading>

        <MotionBox
          className={'collapsible-box'}
          overflow={'hidden'}
          initial={{ height: 0 }}
          animate={{ height: isOpen ? 'auto' : 0 }}
          transition={{ duration: 0.3 }}
        >
          <SimpleGrid
            columns={3}
            py={3}
            borderTop={'1px solid #E7E0BF'}
            borderBottom={'1px solid #E7E0BF'}
            mb={1.5}
            fontSize={'sm'}
          >
            <Box>{parentFontString}</Box>
            <Box pl={3}>
              {'Company size: '}
              {sizes.find(
                ({ value }) => value === order?.metadata?.license?.size?.value
              )?.label || ''}
            </Box>
            <Box></Box>
          </SimpleGrid>

          {groups.map((group) => (
            <SummaryGroup key={group.parentUid} group={group} />
          ))}

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
        </MotionBox>
      </Box>
    </Show>
  )
}
