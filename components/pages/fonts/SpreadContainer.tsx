import useDimensions from '@/components/hooks/useDimensions'
import { Flex } from '@chakra-ui/react'
import React, { createContext, ReactNode, useContext, useRef } from 'react'

function isArray<T>(value: any): value is Array<T> {
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
function mapResponsive(prop: any, mapper: (val: any) => any) {
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

/*
const pageLayout = {
width: 680,
height: 930,
margin: 46,
}
*/

// gets consumed by modules:
// pageMargin
// conversion
// ratio (to calculate paddingBottom)

interface ConfigProps {
  conversion: number
  colWidth: number
  pseudoPadding: string
  padding: string
}

const SpreadContainerContext = createContext<ConfigProps | undefined>(undefined)

interface SpreadContainerProviderProps {
  children: ReactNode
}

const SpreadContainerProvider: React.FC<SpreadContainerProviderProps> = ({
  children,
}) => {
  const targetRef = useRef()
  const size = useDimensions(targetRef)
  const pageWidth = 680
  const pageHeight = 930
  const pageMargin = 46
  const ratio = pageWidth / pageHeight
  const conversion = size.width / 2 / pageWidth
  const colWidth = 558

  // @TODO: this is the config for desktop '50% / 2-up display'
  // for base breakpoint these values need to be halved or something

  return (
    <SpreadContainerContext.Provider
      value={{
        colWidth,
        conversion,
        pseudoPadding: mapResponsive(ratio, (r) => `${(1 / r) * 100}%`),
        padding: `${pageMargin * conversion}px`,
      }}
    >
      <Flex
        // Spread
        w={'85vw'}
        mx={'auto'}
        py={'10vh'}
        pos={'relative'}
        overflow={'hidden'}
        wrap={'wrap'}
        ref={targetRef}
      >
        {children}
      </Flex>
    </SpreadContainerContext.Provider>
  )
}

const useSpreadContainer = () => {
  const context = useContext(SpreadContainerContext)
  if (context === undefined) {
    throw new Error(
      'useSpreadContainer must be used within a SpreadContainerProvider'
    )
  }
  return context
}

export { SpreadContainerProvider, useSpreadContainer }
