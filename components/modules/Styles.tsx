import { useSpreadContainer } from '@/components/pages/fonts/SpreadContainer'
import {
  Box,
  Flex,
  Heading,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
} from '@chakra-ui/react'
import { useRef, useState } from 'react'
import { useFont } from '../pages/fonts/FontContainer'
import ScalableText from './ScalableText'

export interface StylesModuleProps {
  value: any // @TODO: types
}

export default function StylesModule({ value }: StylesModuleProps) {
  const { title } = value
  const { padding, conversion, state } = useSpreadContainer()
  const itemState = state.items[value._key]
  const font = useFont()

  const [tabIndex, setTabIndex] = useState(0)

  const handleSliderChange = (event) => {
    setTabIndex(parseInt(event.target.value, 10))
  }

  const handleTabsChange = (index) => {
    setTabIndex(index)
  }

  const tabList: string[] = []
  const tabPanels: { _id: string; optionName: string }[][] = []

  // has styleGroups defined
  if (font) {
    if (font.styleGroups && font.styleGroups.length > 0) {
      tabList.push(
        ...font.styleGroups.map((styleGroup) => styleGroup.groupName)
      )
      font.styleGroups.forEach((styleGroup) => {
        // protect against empty objects, especially when editing the document in presentation mode
        if (styleGroup.variants?.length > 0) {
          const items = styleGroup.variants
            .map((variant) => variant)
            .filter((item) => item?._id)
          tabPanels.push(items)
        }
      })
      // fallback to 'Standard' group
    } else {
      tabList.push('Standard')
      tabPanels.push(font.variants.map((variant) => variant))
    }
  }

  return (
    <>
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
        <Tabs
          index={tabIndex}
          onChange={handleTabsChange}
          display={'flex'}
          flexDir={'column'}
          // isLazy
          h={'100%'}
          w={'100%'}
          variant={'solid-rounded'}
          size={'sm'}
          colorScheme={'brand'} // @TODO: is a black/white color schema definition a good 'global' approach?
        >
          <TabList zIndex={'popover'}>
            {tabList.map((item, index) => (
              <Tab
                key={'tab-' + index}
                style={{
                  fontSize: 15 * conversion + 'px',
                  lineHeight: 15 * conversion + 'px',
                }}
              >
                {item}
              </Tab>
            ))}
          </TabList>

          <TabPanels h={'100%'} w={'100%'} position={'relative'}>
            {tabPanels.map((items, index) => (
              <TabPanel
                key={'tabPanel-' + index}
                p={0}
                position={'relative'}
                w={'100%'}
                h={'100%'}
                bg={'#FFF'}
                position={'absolute'}
                top={0}
                left={0}
                bottom={0}
                right={0}
              >
                <ScalableText
                  index={index}
                  tabIndex={tabIndex}
                  count={items.length}
                >
                  <Box as={'ul'} sx={{ listStyle: 'none' }}>
                    {items.map((variant) => (
                      <Box
                        as={'li'}
                        key={variant._id}
                        className={variant._id}
                        whiteSpace={'nowrap'}
                      >
                        <Text
                          as={'span'}
                          fontSize={'inherit'}
                          lineHeight={'inherit'}
                        >
                          {variant.optionName}
                        </Text>
                      </Box>
                    ))}
                  </Box>
                </ScalableText>
              </TabPanel>
            ))}
          </TabPanels>
        </Tabs>
      </Flex>
    </>
  )
}
