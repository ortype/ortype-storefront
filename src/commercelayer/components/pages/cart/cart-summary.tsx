import { useOrderContext } from '@/commercelayer/providers/Order'
import { Box, SimpleGrid } from '@chakra-ui/react'

const Summary = () => {
  const { order } = useOrderContext()

  return (
    <Box bg={'#FFF8D3'} px={4} py={5} borderRadius={30} w={'full'}>
      <SimpleGrid columns={3}>
        <Box fontSize={'xl'} textTransform={'uppercase'} fontWeight={'normal'}>
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
  )
}

export default Summary
