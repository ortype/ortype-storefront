import { useFont } from '@/components/pages/fonts/FontContainer'
import { useDimensions } from '@/components/pages/fonts/contexts/dimensionsContext'
import { Box, Center, Flex, Heading, Text } from '@chakra-ui/react'
import Link from 'next/link'
import config from 'sanity.config'

import {
  PortableText,
  type PortableTextBlock,
  type PortableTextComponents,
} from 'next-sanity'

export interface InfoModuleProps {
  value: any // @TODO: types
}

function InfoPortableText({
  className,
  value,
}: {
  className?: string
  value: PortableTextBlock[]
}) {
  const { conversion } = useDimensions()
  const font = useFont()
  const components: PortableTextComponents = {
    block: {
      normal: ({ children }) => (
        <Text fontSize={25 * conversion + 'px'}>{children}</Text>
      ),
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

export default function InfoModule({ value }: InfoModuleProps) {
  const { title, items } = value

  const { padding, conversion } = useDimensions()
  const font = useFont()
  return (
    <>
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
            fontSize={`${13 * conversion}px`}
            lineHeight={`1.5`}
            color={'red'}
            textAlign={'center'}
            fontWeight={'normal'}
            textTransform={'uppercase'}
          >
            {title}
          </Heading>
        </Box>
      )}
      {items && (
        <Box
          as={'dl'}
          m={0}
          my={'1rem'}
          p={0}
          fontSize={25 * conversion + 'px'}
        >
          {items?.map((item) => {
            return (
              <>
                <Box
                  key={item.key}
                  as={'dt'}
                  float={'left'}
                  clear={'left'}
                  w={180 * conversion + 'px'}
                  textTransform={'uppercase'}
                >
                  {item.key + ':'}
                </Box>
                <Box as={'dd'} ml={190 * conversion + 'px'}>
                  <InfoPortableText value={item.content} />
                </Box>
              </>
            )
          })}
        </Box>
      )}
      {font?.languages && font.languages.length > 0 && (
        <>
          <Heading
            as={'h3'}
            fontSize={25 * conversion + 'px'}
            textTransform={'uppercase'}
            fontWeight={'normal'}
            my={'1rem'}
          >
            Supported Languages:
          </Heading>
          <Text fontSize={25 * conversion + 'px'}>
            {font.languages
              .map(({ name }, index) => {
                return name
              })
              .join(', ')}
          </Text>
        </>
      )}
    </>
  )
}
