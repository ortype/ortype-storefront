import { Box, Heading, SimpleGrid } from '@chakra-ui/react'
import { useOrderContext } from '@/commercelayer/providers/Order'
import { TotalAmount } from '@commercelayer/react-components'
import { sizes } from '@/lib/settings'
import { useMemo } from 'react'

const Summary = () => {
  const { order, isLoading } = useOrderContext()

  return (
    <Box bg={'#FFF8D3'} px={4} py={5} borderRadius={30}>
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
          <TotalAmount />
        </Box>
      </SimpleGrid>
    </Box>
  )
}

export default Summary
