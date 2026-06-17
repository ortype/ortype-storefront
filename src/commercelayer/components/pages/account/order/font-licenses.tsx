import {
  expandLineItems,
  filterShoppableItems,
  type ExpandedStyle,
} from '@/commercelayer/utils/expand-group-projections'
import {
  Box,
  Flex,
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
    <SimpleGrid columns={[1, null, 2]} gap={3} bg={'brand.50'} p={3}>
      <Stack direction={'row'} gap={2} alignItems={'center'}>
        <Text fontSize={'2xl'} as={'span'} className={style.skuCode}>
          {style.name}
        </Text>
      </Stack>
      <Flex direction={'row'} px={3} alignItems={'center'} gap={2}>
        {style.licenseTypeLabels.map((label, i) => (
          <Box key={`${style.id}-lt-${i}`} bg={'#fff'} p={2} fontSize={'lg'}>
            {label}
          </Box>
        ))}
      </Flex>
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
        {expandedStyles.map((style) => (
          <StyleRow key={style.id} style={style} />
        ))}
      </Stack>
    </VStack>
  )
}
