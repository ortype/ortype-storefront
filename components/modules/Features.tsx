import { useSpreadContainer } from '@/components/pages/fonts/SpreadContainer'
import {
  Box,
  Center,
  Flex,
  Heading,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
} from '@chakra-ui/react'
import { useFont } from '../pages/fonts/FontContainer'

export interface FeaturesModuleProps {
  value: any // @TODO: types
}

export default function FeaturesModule({ value }: FeaturesModuleProps) {
  const { label, features } = value

  // features mapped to a subnav of tabs
  // features mapped to boxes

  /*
   */
  // Shoot the documentation is confusing with the new v3
  // https://v2.chakra-ui.com/docs/components/tabs (this is v3)
  // this is v1... but not sure about v2
  // https://v1.chakra-ui.com/docs/components/disclosure/tabs#creating-custom-tab-components
  // ...
  // my initial attempt at v1/v2 tabs is not working consistently with a map...

  const { padding, conversion } = useSpreadContainer()
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
            size={'xs'}
            color={'red'}
            textAlign={'center'}
            fontWeight={'normal'}
            textTransform={'uppercase'}
          >
            {'Special Features'}
          </Heading>
        </Box>
        <Tabs
          display={'flex'}
          flexDir={'column'}
          // isLazy
          h={'100%'}
          w={'100%'}
          variant={'solid-rounded'}
          size={'sm'}
          colorScheme={'brand'} // @TODO: is a black/white color schema definition a good 'global' approach?
        >
          <TabList>
            {features.map((feature, index) => (
              <Tab
                key={'tab-' + feature.tag + index}
                style={{
                  fontSize: 15 * conversion + 'px',
                  lineHeight: 15 * conversion + 'px',
                }}
              >
                {feature.title}
              </Tab>
            ))}
          </TabList>

          <TabPanels flex={'1'}>
            {features.map((feature, index) => (
              <TabPanel key={feature.tag + index} p={0} h={'100%'}>
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
              </TabPanel>
            ))}
          </TabPanels>
        </Tabs>
      </>
    )
  )
}
