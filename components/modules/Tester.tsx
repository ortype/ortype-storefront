import { useSpreadContainer } from '@/components/pages/fonts/SpreadContainer'
import {
  Box,
  Center,
  Editable,
  EditablePreview,
  EditableTextarea,
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

export interface TesterModuleProps {
  value: any // @TODO: types
}

export default function TesterModule({ value }: TesterModuleProps) {
  const { title } = value
  const { padding, conversion, state } = useSpreadContainer()
  const itemState = state.items[value._key]
  const font = useFont()

  // Change the selected font style
  // Sliders for each axis

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
          size={'xs'}
          color={'red'}
          textAlign={'center'}
          fontWeight={'normal'}
          textTransform={'uppercase'}
        >
          {value.title}
        </Heading>
      </Box>

      <Editable
        defaultValue={'Test me'}
        textAlign={'center'}
        fontSize={`${140 * conversion}px`}
        lineHeight={`${160 * conversion}px`}
        h={'100%'}
        className={font?.defaultVariant?._id}
      >
        <Center h={'100%'}>
          <EditablePreview flex={1} p={0} border={'none'} />
          <EditableTextarea flex={1} p={0} border={'none'} w={'100%'} />
        </Center>
      </Editable>
    </>
  )
}
