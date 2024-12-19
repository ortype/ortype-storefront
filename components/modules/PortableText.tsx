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
import { Link } from '@chakra-ui/next-js'
import { createDataAttribute } from '@sanity/visual-editing'

import {
  PortableText,
  type PortableTextBlock,
  type PortableTextComponents,
} from 'next-sanity'

import Image from '@/components/global/Image'
import { useFont } from '@/components/pages/fonts/FontContainer'
import { useSpreadContainer } from '@/components/pages/fonts/SpreadContainer'
import { Box, Button, Heading, Text } from '@chakra-ui/react'

export default function CustomPortableText({
  className,
  value,
  index,
}: {
  className?: string
  value: PortableTextBlock[]
  index: number
}) {
  const { conversion } = useSpreadContainer()
  const font = useFont()
  const components: PortableTextComponents = {
    block: {
      h2: ({ children, value }) => (
        <Heading id={value._key} variant="caps" size={{ base: 'md', lg: 'xl' }}>
          {children}
        </Heading>
      ),
      normal: ({ children }) => (
        <Text
          fontSize={38 * conversion + 'px'}
          lineHeight={49 * conversion + 'px'}
          className={font?.defaultVariant?._id}
          // noOfLines={17}
        >
          {children}
        </Text>
      ),
    },
    types: {
      image: (props) => {
        const display = props.value.config?.display
        const thumbnail = props.value.config?.thumbnail
        const vertical = display === 'vertical'
        const horizontal = display === 'horizontal'

        const thumbW = 300 * conversion + 'px'
        let style = { width: thumbnail ? thumbW : '100%', height: 'auto' }
        if (vertical) {
          style = { width: 'auto', height: '100%' }
        }

        const attr = createDataAttribute({
          id: font?._id,
          type: 'font',
          path: 'modules',
        })
        const attrVal = attr(
          `[${index}]body[${props.index}][_key=="${props.value._key}"]`
        ).toString()

        // console.log('image createDataAttribute props: ', font?._id, attrVal)

        return (
          <Box
            as={'figure'}
            sx={{ img: { mx: 'auto' } }}
            textAlign={thumbnail ? 'center' : 'left'}
            h={vertical ? '100%' : 'auto'}
          >
            <Image
              data-sanity={attrVal}
              image={props.value}
              style={style}
              sizes={
                // if thumbnail set width or height to max-width instead of width
                thumbnail
                  ? `(max-width: ${thumbW}) 100vw, ${thumbW}`
                  : '(max-width: 800px) 100vw, 800px'
              }
            />
            {props.value.caption && (
              <Text as={'figcaption'} fontSize={11 * conversion + 'px'}>
                {props.value.caption}
              </Text>
            )}
          </Box>
        )
      },
    },
    marks: {
      link: ({ value, children }) => {
        // Read https://css-tricks.com/use-target_blank/
        const { blank, href } = value
        return blank ? (
          <Link
            color={'#0000FF'}
            textDecor={'underline'}
            href={href}
            target="_blank"
            rel="noopener"
          >
            {children}
          </Link>
        ) : (
          <Link href={href} color={'#0000FF'} textDecor={'underline'}>
            {children}
          </Link>
        )
      },
      internalLink: ({ children, value }) => {
        const { slug = {} } = value
        const href = `/${slug.current}`
        return (
          <Button
            as={Link}
            href={href}
            fontSize={38 * conversion + 'px'}
            borderRadius={38 * conversion + 'px'}
            variant={'outline'}
            colorScheme={'brand'}
            fontWeight={'normal'}
            bg={'#000'}
            color={'#FFF'}
            borderWidth={'2px'}
            borderColor={'#000'}
            _hover={{
              textDecoration: 'none',
              bg: '#FFF',
              color: '#000',
              borderColor: '#000',
            }}
          >
            {children}
          </Button>
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
