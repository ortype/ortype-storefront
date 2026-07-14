'use client'
import {
  computeOrderTotals,
  expandAndGroupLineItems,
  type ExpandedFontGroup,
} from '@/commercelayer/utils/expand-group-projections'
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

/** Collapsible font family group within the order summary */
const SummaryGroup: React.FC<{ group: ExpandedFontGroup }> = ({ group }) => {
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
          <SimpleGrid
            w={'full'}
            columns={3}
            fontSize={'sm'}
            lineHeight={1.1}
            gap={2}
          >
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
              {`${group.styleCount} ${
                group.styleCount === 1 ? 'style' : 'styles'
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
        {group.styles.map((style) => {
          const priceFloat =
            style.priceCents != null
              ? Math.round(style.priceCents) / 100
              : undefined

          return (
            <SimpleGrid
              key={style.id}
              columns={3}
              py={1}
              pl={5}
              fontSize={'sm'}
              lineHeight={1.1}
              gap={2}
            >
              <Box>{style.name}</Box>
              <Box fontSize={'xs'}>{style.licenseTypeLabels.join(', ')}</Box>
              <Box textAlign={'right'} fontVariantNumeric={'tabular-nums'}>
                {priceFloat != null ? `${priceFloat} EUR` : ''}
              </Box>
            </SimpleGrid>
          )
        })}
      </Collapsible.Content>
    </Collapsible.Root>
  )
}

interface OrderSummaryProps {
  /** Order data containing line items and metadata */
  order: any
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
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({
  order,
  hasLineItems,
  isOpen,
  toggleBox,
  heading = 'Order Overview',
  emptyText = 'Your cart is empty',
  readonly,
}) => {
  const {
    groups,
    parentFontCount,
    allStylesCount,
    subtotalAmount,
    totalDiscount,
  } = useMemo(() => {
    if (!order?.line_items) {
      return {
        groups: [] as ExpandedFontGroup[],
        parentFontCount: '0 fonts',
        allStylesCount: '0 styles',
        subtotalAmount: 0,
        totalDiscount: 0,
      }
    }

    const groups = expandAndGroupLineItems(order.line_items)
    const { subtotalAmount, totalDiscount } = computeOrderTotals(groups)

    const fontCount = groups.length
    const styleCount = groups.reduce((sum, g) => sum + g.styleCount, 0)
    return {
      groups,
      parentFontCount: fontCount + ' ' + (fontCount === 1 ? 'font' : 'fonts'),
      allStylesCount: styleCount + ' styles',
      subtotalAmount: Math.round(subtotalAmount * 100) / 100,
      totalDiscount,
    }
  }, [order?.line_items])

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
            <Box>{parentFontCount}</Box>
            <Box pl={3}>{allStylesCount}</Box>
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
