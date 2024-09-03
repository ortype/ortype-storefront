import PortableText from '@/components/modules/PortableText'
import { useSpreadContainer } from '@/components/pages/fonts/SpreadContainer'
import { Box, Flex, Heading } from '@chakra-ui/react'
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
      overflowY={'auto'}
    >
      {value.title && (
        <Box
          pos={'absolute'}
          top={0}
          right={0}
          left={0}
          style={{
            padding: `0 ${padding}`,
          }}
        >
          <Heading
            pt={'0.5rem'}
            pb={'0.25rem'}
            borderBottom={'1px solid #000'}
            size={'xs'}
            color={'red'}
            textAlign={'center'}
            fontWeight={'normal'}
            textTransform={'uppercase'}
          >
            {value.title}
          </Heading>
        </Box>
      )}
      <Flex
        direction={'column'}
        justifyContent={'space-between'}
        h={'100%'}
        /*sx={{
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
        }}*/
      >
        <PortableText value={value.body} />
      </Flex>
    </Flex>
  )
}

export default Content
