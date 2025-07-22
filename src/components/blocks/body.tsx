// import BlockCarousel from '@/components/blocks/carousel'
import BlockImage from '@/components/blocks/image'
import Video from '@/components/modules/Video'
import { dataset, projectId } from '@/sanity/env'
import {
  AspectRatio,
  Box,
  Link as ChakraLink,
  Heading,
  Text,
} from '@chakra-ui/react'
import { PortableText } from '@portabletext/react'
import Link from 'next/link'
import React from 'react'

const components = {
  block: {
    h2: ({ children, value }) => (
      <Heading
        id={value._key}
        textAlign="center"
        size={{ base: 'md', lg: 'xl' }}
        lineHeight={'short'}
      >
        {children}
      </Heading>
    ),
    normal: ({ children }) => <Text>{children}</Text>,
  },
  types: {
    // 'module.carousel': (props) => <BlockCarousel {...props} />,
    'module.image': (props) => (
      <Box
      // gridColumn={props.value.fullWidth ? { base: '1/9', xl: '3/7' } : '1/6'}
      // mx={{ base: '-50px', xl: 0 }}
      >
        <BlockImage
          {...props}
          fullWidth={props.value.fullWidth}
          value={props.value}
        />
      </Box>
    ),
    'module.video': (props) => (
      <Box
        pos={'relative'}
        overflow={'hidden'}
        css={{
          '& > div > div > div': { position: 'inherit !important' },
        }}
      >
        <Video
          {...props}
          style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
        />
      </Box>
    ),
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
