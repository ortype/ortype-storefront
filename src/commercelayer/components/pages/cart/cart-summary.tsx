import { useOrderContext } from '@/commercelayer/providers/Order'
import { Box, SimpleGrid } from '@chakra-ui/react'

const Summary = () => {
  const { order } = useOrderContext()

  return (
    <Box bg={'#FFF8D3'} px={4} py={5} borderRadius={30} w={'full'}>
      <SimpleGrid columns={2} pt={3} pb={2} mt={1.5}>
        <Box fontSize={'lg'} fontWeight={'normal'}>
          {'Subtotal (excl. discounts)'}
        </Box>
        <Box
          fontSize={'lg'}
          textAlign={'right'}
          fontVariantNumeric={'tabular-nums'}
        >
          {`${order?.total_amount_with_taxes_float} EUR`}
        </Box>
      </SimpleGrid>
      <SimpleGrid columns={2} py={3}>
        <Box fontSize={'xl'} textTransform={'uppercase'} fontWeight={'normal'}>
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
  )
}

export default Summary
