import { useBookLayoutStore } from '@/components/data/BookProvider'
import useDimensions from '@/components/hooks/useDimensions'
import { useMouse } from '@/components/hooks/useMouse'
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

type BottomGuideProps = {
  label: string
  bottom: number
  editMode: boolean
}

const BottomGuide: React.FC<BottomGuideProps> = ({
  label,
  bottom,
  editMode,
}) => {
  return (
    <>
      <Box
        style={{ bottom: bottom + 'px' }}
        sx={{
          display: editMode ? 'block' : 'none',
          position: 'absolute',
          height: '1px',
          background: '#ff4fff',
          width: '100%',
        }}
      />
      <Box
        style={{ bottom: -bottom + 'px' }}
        sx={{
          color: '#FFF',
          position: 'absolute',
          width: '100%',
          textAlign: 'center',
          fontSize: '12px',
        }}
      >
        {label}
      </Box>
    </>
  )
}

const Spread: React.FC<{}> = ({}) => {
  const [state, ref] = useMouse()
  const bookLayoutStore = useBookLayoutStore()
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
  return (
    <Flex
      // Spread
      id={bookLayoutStore.layoutOption.value}
      w={'85vw'}
      mx={'auto'}
      py={'10vh'}
      ref={ref}
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
          editMode={bookLayoutStore.editMode}
          pageMargin={pageMargin}
          conversion={conversion}
          page={bookLayoutStore.spread.verso}
          label={'verso'}
        />
        <BottomGuide
          label={'Verso'}
          bottom={pageMargin * conversion}
          editMode={bookLayoutStore.editMode}
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
          editMode={bookLayoutStore.editMode}
          pageMargin={pageMargin}
          conversion={conversion}
          label={'recto'}
          page={bookLayoutStore.spread.recto}
        />

        <BottomGuide
          label={'Recto'}
          bottom={pageMargin * conversion}
          editMode={bookLayoutStore.editMode}
        />
      </Box>
      <Box
        style={{ top: state.elementY + 'px' }}
        sx={{
          display: bookLayoutStore.editMode ? 'block' : 'none',
          position: 'absolute',
          height: '1px',
          background: '#7abad9',
          width: '100%',
        }}
      />
    </Flex>
  )
}

export default Spread
