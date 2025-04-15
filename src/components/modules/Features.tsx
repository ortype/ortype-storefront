import { useDimensions } from '@/components/pages/fonts/contexts/dimensionsContext'
import { Box, Center, Flex, Heading, Tabs, Text } from '@chakra-ui/react'
import { useFont } from '../pages/fonts/FontContainer'

export interface FeaturesModuleProps {
  value: any // @TODO: types
}
/*
features:[…] 1 item
0:{…} 5 properties
_key:4e2ab31a1fa2
_type:feature
example:Über
tag:ss01
title:Ü
label:Special Features
*/

export default function FeaturesModule({ value }: FeaturesModuleProps) {
  const { label, features } = value

  // features mapped to a subnav of tabs
  // features mapped to boxes

  const { padding, conversion } = useDimensions()
  const font = useFont()
  return (
    features?.length > 0 && (
      <>
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
            {'Special Features'}
          </Heading>
        </Box>
        <Tabs.Root
          // onValueChange={(e) => setValue(e.value)}
          display={'flex'}
          flexDir={'column'}
          // isLazy
          h={'100%'}
          w={'100%'}
          variant={'plain'}
          colorPalette={'brand'}
          defaultValue={'tab-0'}
          orientation={'horizontal'}
          size={'sm'}
          colorScheme={'brand'} // @TODO: is a black/white color schema definition a good 'global' approach?
        >
          <Tabs.List
            // @NOTE: styles for 'sidebar' layout
            // zIndex={'docked'}
            // pos={'absolute'}
            // h={'100%'}
            // left={`calc(100% + ${padding} + 0.5rem)`}
            // justifyContent={'center'}
            flexWrap={'wrap'}
            gap={1}
            mb={'1rem'}
          >
            {features.map((feature, index) => (
              <Tabs.Trigger
                _selected={{
                  bg: '#000',
                  color: '#FFF',
                }}
                textAlign={'left'}
                key={'tab-' + index}
                value={'tab-' + index}
                borderRadius={'2rem'}
                color={'#000'}
                h={28 * conversion + 'px'}
                border={'1px solid #000'}
                textTransform={'uppercase'}
                style={{
                  fontSize: 14 * conversion + 'px',
                  lineHeight: 14 * conversion + 'px',
                }}
              >
                {feature.title}
              </Tabs.Trigger>
            ))}
          </Tabs.List>

          <Tabs.ContentGroup flex={'1'}>
            {features.map((feature, index) => (
              <Tabs.Content
                key={feature.tag + index}
                value={'tab-' + index}
                p={0}
                h={'100%'}
              >
                <Flex direction={'column'} h={'100%'}>
                  <Flex flex={'1 1 50%'} direction={'column'} mb={'2rem'}>
                    <Text
                      as={'span'}
                      color={'red'}
                      style={{
                        fontSize: `${14 * conversion}px`,
                        margin: `${7 * conversion}px 0`,
                      }}
                    >
                      {'Default'}
                    </Text>
                    <Box border={'1px solid #000'} flex={'1'}>
                      <Center
                        h={'100%'}
                        style={{ fontSize: `${140 * conversion}px` }}
                        className={font?.defaultVariant?._id}
                      >
                        {feature.example}
                      </Center>
                    </Box>
                  </Flex>
                  <Flex flex={'1 1 50%'} direction={'column'}>
                    <Text
                      as={'span'}
                      color={'red'}
                      style={{
                        fontSize: `${14 * conversion}px`,
                        margin: `${7 * conversion}px 0`,
                      }}
                    >
                      {label}
                    </Text>
                    <Box border={'1px solid #000'} flex={'1'}>
                      <Center
                        h={'100%'}
                        style={{
                          fontSize: `${140 * conversion}px`,
                          fontFeatureSettings: `'${feature.tag}'`,
                        }}
                        className={font?.defaultVariant?._id}
                      >
                        {feature.example}
                      </Center>
                    </Box>
                  </Flex>
                </Flex>
              </Tabs.Content>
            ))}
          </Tabs.ContentGroup>
        </Tabs.Root>
      </>
    )
  )
}
