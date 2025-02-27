import BlockCarousel from '@/components/blocks/carousel'
import BlockImage from '@/components/blocks/image'
// import Video from '@/components/modules/video'
import { dataset, projectId } from '@/sanity/env'
import { Box, Link as ChakraLink, Heading, Text } from '@chakra-ui/react'
import { PortableText } from '@portabletext/react'
import Link from 'next/link'
import React from 'react'

const GRID_COLUMN = { base: '1/9', lg: '1/7', xl: '3/7' }

const components = {
  block: {
    h2: ({ children, value }) => (
      <Heading
        id={value._key}
        gridColumn={GRID_COLUMN}
        textAlign="center"
        visual="caps"
        size={{ base: 'md', lg: 'xl' }}
        lineHeight={'short'}
      >
        {children}
      </Heading>
    ),
    normal: ({ children }) => (
      <Text gridColumn={GRID_COLUMN} textStyle={{ base: 'rism', lg: 'rimd' }}>
        {children}
      </Text>
    ),
  },
  types: {
    'module.carousel': (props) => <BlockCarousel {...props} />,
    'module.image': (props) => (
      <Box
        gridColumn={props.value.fullWidth ? { base: '1/9', xl: '3/7' } : '1/6'}
        mx={{ base: '-50px', xl: 0 }}
      >
        <BlockImage
          {...props}
          fullWidth={props.value.fullWidth}
          value={props.value}
        />
      </Box>
    ),
    // 'module.video': (props) => (
    //   <Box gridColumn={GRID_COLUMN}>
    //     <Video {...props} />
    //   </Box>
    // ),
  },
  marks: {
    annotationLinkInternal: ({ text, value }) => {
      return (
        <ChakraLink
          as={Link}
          textDecoration={'underline'}
          href={`/${value?.reference?.slug?.current}`}
        >
          {text}
        </ChakraLink>
      )
    },
    annotationLinkExternal: ({ text, value }) => {
      return (
        <ChakraLink textDecoration={'underline'} href={value?.url} isExternal>
          {text}
        </ChakraLink>
      )
    },
    annotationLinkEmail: ({ text, value }) => {
      return (
        <ChakraLink
          textDecoration={'underline'}
          href={`mailto:${value?.email}`}
        >
          {text}
        </ChakraLink>
      )
    },
  },
}

const Body = ({ value }) => {
  return (
    <PortableText
      value={value}
      components={components}
      onMissingComponent={false}
      projectId={projectId}
      dataset={dataset}
    />
  )
}

export default Body
