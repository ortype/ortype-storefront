import { useDimensions } from '@/components/pages/fonts/contexts/dimensionsContext'
import { useSpreadState } from '@/components/pages/fonts/contexts/spreadStateContext'
import { Box, Flex, Heading, Tabs, Text } from '@chakra-ui/react'
import { useRef, useState } from 'react'
import { useFont } from '../pages/fonts/FontContainer'
import ScalableText from './ScalableText'

export interface StylesModuleProps {
  value: any // @TODO: types
}

export default function StylesModule({ value }: StylesModuleProps) {
  const { title, config } = value
  const { padding, conversion } = useDimensions()
  const { state } = useSpreadState()
  // const itemState = state.items[value._key]
  const font = useFont()

  const [tabValue, setValue] = useState<string | null>('tab-0')

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
        if (
          styleGroup.variants?.length > 0 ||
          styleGroup.italicVariants?.length > 0
        ) {
          const uprightVariants =
            styleGroup.variants
              ?.map((variant) => variant)
              .filter((item) => item?._id) ?? []
          const italicVariants =
            styleGroup.italicVariants
              ?.map((variant) => variant)
              .filter((item) => item?._id) ?? []
          const items = [...uprightVariants, ...italicVariants]
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
          {value.title}
        </Heading>
      </Box>
      <Tabs.Root
        onValueChange={(e) => setValue(e.value)}
        display={'flex'}
        flexDir={'column'}
        // isLazy
        h={'100%'}
        w={'100%'}
        orientation={'horizontal'}
        variant={'plain'}
        colorPalette={'brand'}
        defaultValue={'tab-0'}
        size={'sm'}
        lazyMount
        unmountOnExit
        //activationMode={'manual'}
        colorScheme={'brand'} // @TODO: is a black/white color schema definition a good 'global' approach?
      >
        {tabList.length > 1 && (
          <Tabs.List
            // @NOTE: styles for 'sidebar' layout
            // zIndex={'docked'}
            // pos={'absolute'}
            // h={'100%'}
            // left={`calc(100% + ${padding} + 0.5rem)`}
            // justifyContent={'center'}
            flexWrap={'wrap'}
            mb={'1rem'}
            gap={1}
          >
            {tabList.map((item, index) => (
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
                {item}
              </Tabs.Trigger>
            ))}
            {/*<Tabs.Indicator rounded={'l2'} />*/}
          </Tabs.List>
        )}

        <Tabs.ContentGroup h={'100%'} w={'100%'} position={'relative'}>
          {tabPanels.map((items, index) => (
            <Tabs.Content
              value={'tab-' + index}
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
                tabIndex={tabValue}
                count={items.length}
              >
                <Box as={'ul'} css={{ listStyle: 'none' }}>
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
            </Tabs.Content>
          ))}
        </Tabs.ContentGroup>
      </Tabs.Root>
    </>
  )
}
