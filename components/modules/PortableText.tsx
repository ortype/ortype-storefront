/**
 * This component uses Portable Text to render a post body.
 *
 * You can learn more about Portable Text on:
 * https://www.sanity.io/docs/block-content
 * https://github.com/portabletext/react-portabletext
 * https://portabletext.org/
 *
 */

import config from '@/sanity.config'

import {
  PortableText,
  type PortableTextBlock,
  type PortableTextComponents,
} from 'next-sanity'

import Image from '@/components/global/Image'
import { Box, Heading, Text } from '@chakra-ui/react'

export default function CustomPortableText({
  className,
  value,
}: {
  className?: string
  value: PortableTextBlock[]
}) {
  const components: PortableTextComponents = {
    block: {
      h2: ({ children, value }) => (
        <Heading id={value._key} variant="caps" size={{ base: 'md', lg: 'xl' }}>
          {children}
        </Heading>
      ),
      normal: ({ children }) => <Text>{children}</Text>,
    },
    types: {
      image: (props) => (
        <Box>
          <Image image={props.value} />
        </Box>
      ),
    },
    marks: {
      link: ({ children, value }) => {
        return (
          <a href={value?.href} rel="noreferrer noopener">
            {children}
          </a>
        )
      },
    },
  }

  return (
    <PortableText
      components={components}
      value={value as PortableTextBlock[]}
      onMissingComponent={false}
      {...config}
    />
  )
}
