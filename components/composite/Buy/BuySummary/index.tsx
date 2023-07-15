import { Box, Heading, SimpleGrid } from '@chakra-ui/react'
import {
  LineItem,
  LineItemAmount,
  LineItemName,
  LineItemOption,
  LineItemOptions,
  LineItemRemoveLink,
  LineItemsContainer,
  TotalAmount,
  useOrderContainer,
} from '@commercelayer/react-components'
import { sizes } from 'lib/settings'

export const BuySummary = () => {
  const { order } = useOrderContainer()
  return (
    <Box bg={'#FFF8D3'} my={4} p={4} borderRadius={20}>
      <Heading
        as={'h5'}
        fontSize={20}
        textTransform={'uppercase'}
        fontWeight={'normal'}
      >
        {'Summary'}
      </Heading>
      {/* @TODO: the LineItemsContainer does not reliably update when adding items manually */}
      <LineItemsContainer>
        <SimpleGrid
          columns={3}
          spacing={4}
          borderTop={'1px solid #EEE'}
          borderBottom={'1px solid #EEE'}
        >
          <Box></Box>
          <Box>
            {
              sizes.find(
                ({ value }) => value === order?.metadata?.license?.size?.value
              )?.label
            }
          </Box>
          <Box></Box>
        </SimpleGrid>
        <LineItem>
          <SimpleGrid columns={3} spacing={4} borderBottom={'1px solid #EEE'}>
            {/*<LineItemImage width={50} />*/}
            <LineItemName />
            <Box>
              <LineItemOptions showName showAll>
                <LineItemOption />
              </LineItemOptions>
            </Box>
            <Box textAlign={'right'}>
              <LineItemAmount />
              <Box as={LineItemRemoveLink} ml={2} />
            </Box>
            {/*<LineItemQuantity max={10} />*/}
            {/*<Errors resource="line_items" field="quantity" />*/}
          </SimpleGrid>
        </LineItem>
      </LineItemsContainer>

      <SimpleGrid columns={3} spacing={4}>
        <Box
          fontSize={20}
          textTransform={'uppercase'}
          fontWeight={'normal'}
          textDecoration={'underline'}
        >
          {'Total'}
        </Box>
        <Box></Box>
        <Box textAlign={'right'}>
          <TotalAmount />
        </Box>
      </SimpleGrid>
    </Box>
  )
}
