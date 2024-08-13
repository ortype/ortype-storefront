import { useBookLayoutStore } from '@/components/data/BookProvider'
import useDimensions from '@/components/hooks/useDimensions'
import { Box, Flex } from '@chakra-ui/react'
import { useRef } from 'react'
import RectoVerso from './RectoVerso'

export function isArray<T>(value: any): value is Array<T> {
  return Array.isArray(value)
}

function isObject(value: any): value is Record<string, any> {
  const type = typeof value
  return (
    value != null &&
    (type === 'object' || type === 'function') &&
    !isArray(value)
  )
}
export function mapResponsive(prop: any, mapper: (val: any) => any) {
  if (Array.isArray(prop)) {
    return prop.map((item) => (item === null ? null : mapper(item)))
  }

  if (isObject(prop)) {
    return Object.keys(prop).reduce((result: Record<string, any>, key) => {
      result[key] = mapper(prop[key])
      return result
    }, {})
  }

  if (prop != null) {
    return mapper(prop)
  }

  return null
}

const Spread: React.FC<{
  defaultVariantId: string
  spread: any
  config: { display: string }
}> = ({ spread, defaultVariantId, config }) => {
  const targetRef = useRef()
  const size = useDimensions(targetRef)

  const pageLayout = {
    width: 680,
    height: 930,
    margin: 46,
  }
  const pageWidth = 680
  const pageHeight = 930
  const pageMargin = 46
  const ratio = pageWidth / pageHeight
  const conversion = size.width / pageWidth

  console.log('Book Module config: ', config)
  // @TOOD: handle config string values 'recto' or 'verso'... 'spread' is the default

  return (
    <Flex
      // Spread
      w={'85vw'}
      mx={'auto'}
      py={'10vh'}
      pos={'relative'}
      overflow={'hidden'}
    >
      <Box
        // Verso page
        ref={targetRef}
        // maxW={'calc(100vw - 30rem)'}
        flex={'0 0 50%'}
        position="relative"
        // the before creates the height
        _before={{
          height: 0,
          content: `""`,
          display: 'block',
          paddingBottom: mapResponsive(ratio, (r) => `${(1 / r) * 100}%`),
        }}
      >
        <RectoVerso
          pageMargin={pageMargin}
          conversion={conversion}
          page={spread.verso}
          defaultVariantId={defaultVariantId}
          label={'verso'}
        />
      </Box>
      <Box
        // Recto page
        flex={'0 0 50%'}
        position="relative"
        _before={{
          height: 0,
          content: `""`,
          display: 'block',
          paddingBottom: mapResponsive(ratio, (r) => `${(1 / r) * 100}%`),
        }}
      >
        <RectoVerso
          pageMargin={pageMargin}
          conversion={conversion}
          label={'recto'}
          page={spread.recto}
          defaultVariantId={defaultVariantId}
        />
      </Box>
    </Flex>
  )
}

export default Spread
