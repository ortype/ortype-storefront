import {
  expandLineItems,
  filterShoppableItems,
  type ExpandedStyle,
} from '@/commercelayer/utils/expand-group-projections'
import { Tag } from '@/components/ui/tag'
import {
  Box,
  Flex,
  GridItem,
  HStack,
  SimpleGrid,
  Stack,
  Text,
  VStack,
} from '@chakra-ui/react'
import React, { useMemo } from 'react'

interface FontLicensesProps {
  order: any
}

const StyleRow: React.FC<{ style: ExpandedStyle }> = ({ style }) => {
  return (
    <SimpleGrid columns={[1, null, 3]} gap={4} bg={'brand.50'} p={3}>
      <GridItem colSpan={2}>
        <Stack direction={'row'} gap={2} alignItems={'center'}>
          <Text fontSize={'2xl'} as={'span'} className={style.skuCode}>
            {style.name}
          </Text>
        </Stack>
      </GridItem>
      <HStack gap={1} flexWrap={'wrap'} alignItems={'center'}>
        {style.licenseTypeLabels.map((label) => (
          <Tag
            key={label}
            bg={'colorPalette.bg'}
            size={'md'}
            variant={'solid'}
            borderRadius={'100px'}
            _hover={{ boxShadow: 'none' }}
          >
            {label}
          </Tag>
        ))}
      </HStack>
    </SimpleGrid>
  )
}

export const FontLicenses: React.FC<FontLicensesProps> = ({ order }) => {
  const expandedStyles = useMemo(() => {
    if (!order?.line_items) return []
    const shoppable = filterShoppableItems(order.line_items)
    return expandLineItems(shoppable)
  }, [order?.line_items])

  return (
    <VStack gap={2} w={'full'} alignItems={'flex-start'}>
      <SimpleGrid columns={3} gap={4} w={'full'}>
        <GridItem
          px={3}
          fontSize={'xs'}
          textTransform={'uppercase'}
          color={'#737373'}
          colSpan={2}
          asChild
        >
          <Flex gap={1} alignItems={'center'}>
            {'Typefaces'}
          </Flex>
        </GridItem>
        <Box
          px={0}
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
        {expandedStyles.map((style) => (
          <StyleRow key={style.id} style={style} />
        ))}
      </Stack>
    </VStack>
  )
}
