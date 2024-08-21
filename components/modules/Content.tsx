import PortableText from '@/components/modules/PortableText'
import { useSpreadContainer } from '@/components/pages/fonts/SpreadContainer'
import { Box, Flex } from '@chakra-ui/react'
import React from 'react'

const Content: React.FC<{
  value: any
}> = ({ value }) => {
  const { padding } = useSpreadContainer()
  return (
    <Flex
      w={'100%'}
      h={'100%'}
      bg={'#FFF'}
      position={'absolute'}
      top={0}
      left={0}
      bottom={0}
      right={0}
      wrap={'wrap'}
      alignContent={'flex-start'}
      style={{
        padding,
      }}
    >
      <Box
        sx={{
          '> div + div': {
            mt: 100,
          },
          '> p + p': {
            mt: 2,
          },
          '> div + h2': {
            mt: 100,
          },
          '> h2 + p': {
            mt: 50,
          },
          '> p + h2': {
            mt: 100,
          },
          '> div + p, > p + div': {
            mt: 100,
          },
          '> #toc + h2': {
            mt: 0,
          },
        }}
      >
        <PortableText value={value.body} />
      </Box>
    </Flex>
  )
}

export default Content
