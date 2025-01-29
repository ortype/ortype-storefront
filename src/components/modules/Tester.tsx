import { useSpreadContainer } from '@/components/pages/fonts/SpreadContainer'
import { Box, Center, Editable, Flex, Heading, Text } from '@chakra-ui/react'
import { useRef, useState } from 'react'
import { useFont } from '../pages/fonts/FontContainer'

export interface TesterModuleProps {
  value: any // @TODO: types
}

export default function TesterModule({ value }: TesterModuleProps) {
  const { title, defaultVariant, defaultText } = value
  const { padding, conversion, state } = useSpreadContainer()
  const itemState = state.items[value._key]
  const font = useFont()

  // Change the selected font style
  // Sliders for each axis

  const textStyles = {
    flex: '0 1 auto',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    minHeight: '1em',
    maxWidth: '100%',
    textAlign: 'center',
    margin: '0',
    padding: '0',
    font: 'inherit',
    fontSize: 'inherit',
    lineHeight: 'inherit',
    letterSpacing: 'inherit',
    wordSpacing: 'inherit',
    outline: 'none',
    whiteSpace: 'pre-wrap' /* Preserves spaces and wraps */,
    wordWrap: 'break-word' /* Breaks long words if needed */,
    overflowWrap: 'break-word' /* Modern property for breaking long words */,
    wordBreak: 'break-word' /* Prevents unnatural word breaks */,
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

      <Editable.Root
        defaultValue={defaultText ?? 'Test me'}
        textAlign={'center'}
        fontSize={`${220 * conversion}px`}
        lineHeight={`${220 * conversion}px`}
        h={'100%'}
        className={
          (defaultVariant?._ref || defaultVariant?._id) ??
          font?.defaultVariant?._id
        }
      >
        <Editable.Preview css={textStyles} />
        <Editable.Input
          p={0}
          border={'none'}
          css={{
            ...textStyles,
          }}
        />
      </Editable.Root>
    </>
  )
}
