import useDimensions from '@/components/hooks/useDimensions'
import { Flex } from '@chakra-ui/react'
import React, {
  createContext,
  Dispatch,
  ReactNode,
  useContext,
  useReducer,
  useRef,
} from 'react'

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

interface State {
  [index: number]: {
    value: boolean
    overflowCol: boolean
  }
}

interface Action {
  type: 'SET_OVERFLOW'
  index: number
  isOverflowing: {
    value: boolean
    overflowCol: boolean
  }
}

interface ConfigProps {
  conversion: number
  colWidth: number
  pseudoPadding: string
  spreadAspect: string
  pageAspect: string
  padding: string
  dispatch: Dispatch<Action>
  state: State
}

const SpreadContainerContext = createContext<ConfigProps | undefined>(undefined)

const initialState: State = {}

const spreadContainerReducer = (state: State, action: Action): State => {
  console.log(
    'spreadContainerReducer: ',
    action.type,
    action.index,
    action.isOverflowing
  )
  switch (action.type) {
    case 'SET_OVERFLOW':
      return {
        ...state,
        // [action._key]: {
        // index: action.module.index
        // isOverflowing: action.module.isOverflowing
        // overflowCol: action.module.overflowCol
        // },
        [action.index]: {
          value: action.isOverflowing.value,
          overflowCol: action.isOverflowing.overflowCol,
        },
      }
    default:
      return state
  }
}

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

  // track overflow index
  const [state, dispatch] = useReducer(spreadContainerReducer, initialState)

  // @TODO: this is the config for desktop '50% / 2-up display'
  // for base breakpoint these values need to be halved or something

  return (
    <SpreadContainerContext.Provider
      value={{
        colWidth,
        conversion,
        pseudoPadding: mapResponsive(ratio, (r) => `${(r / 1) * 100}%`),
        spreadAspect: mapResponsive(ratio, (r) => `${(r / 1) * 100}%`),
        pageAspect: mapResponsive(ratio, (r) => `${(1 / r) * 100}%`),
        padding: `${pageMargin * conversion}px`,
        state,
        dispatch,
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
