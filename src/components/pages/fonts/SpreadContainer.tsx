import useDimensions from '@/components/hooks/useDimensions'
import { MIN_DEFAULT_MQ } from '@/utils/presets'
import { Flex, useBreakpointValue, useMediaQuery } from '@chakra-ui/react'
import type { ChildrenElement } from 'CustomApp'
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

// Define types for the item and state

interface Item {
  _key: string
  _type: string
  overflowCol: boolean
  index: number
  isOverflowing: boolean // @TODO: this is not included in the initial items
}

interface State {
  items: { [key: string]: Item }
  order: string[] // Array to keep the order of ids
}

const UPDATE_ITEMS = 'UPDATE_ITEMS'
const UPDATE_ITEM = 'UPDATE_ITEM'

interface UpdateItemsPayload {
  _key: string
  isOverflowing: boolean
}

interface UpdateItemPayload {
  _key: string
  isOverflowing: boolean
  overflowCol?: boolean
  index?: number
}

type Payload = UpdateItemsPayload | UpdateItemPayload

interface Action {
  type: string
  payload: Payload
}

interface SpreadContainerProviderValue {
  conversion: number
  colWidth: number
  spreadAspect: string
  pageAspect: string
  padding: string
  state: State
  updateItemsAction: (payload: UpdateItemsPayload) => void
  updateItemAction: (payload: UpdateItemPayload) => void
}

interface SpreadContainerProviderProps {
  initialItems: Item[]
  children:
    | ((props: SpreadContainerProviderValue) => ChildrenElement)
    | ChildrenElement
}

const SpreadContainerContext = createContext<SpreadContainerProviderValue>(
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  {} as SpreadContainerProviderValue
)
// @TODO: rename to something like `useCLayerSettings`
export const useSpreadContainer = (): SpreadContainerProviderValue => {
  const context = useContext(SpreadContainerContext)
  if (context === undefined) {
    throw new Error(
      'useSpreadContainer must be used within a SpreadContainerProvider'
    )
  }
  return context
}

const updateItem = (state: State, payload: UpdateItemPayload): State => {
  const { _key, isOverflowing, index } = payload
  if (!state.items[_key]) return state

  return {
    ...state,
    items: {
      ...state.items,
      [_key]: {
        ...state.items[_key],
        isOverflowing: isOverflowing,
        index: index ?? state.items[_key].index,
      },
    },
  }
}

const updateItems = (state: State, payload: UpdateItemsPayload): State => {
  const { order } = state
  const { isOverflowing } = payload

  if (!isOverflowing) return state
  console.log('updateItemsAction running for: ', payload._key)
  let newState = { ...state }
  for (let i = 0; i < order.length; i++) {
    // ok we start from the current _key's index
    if (order[i] === payload._key) {
      for (let j = i + 1; j < order.length; j++) {
        // start 1 index item after
        // order[j] === item._key
        newState = {
          ...newState,
          items: {
            ...newState.items,
            [order[j]]: {
              ...newState.items[order[j]],
              index: newState.items[order[j]].index + 1,
            },
          },
        }
      }
      break
    }
  }

  return newState
}

const spreadContainerReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'UPDATE_ITEMS':
      return updateItems(state, action.payload)
    case UPDATE_ITEM:
      return updateItem(state, action.payload as UpdateItemPayload)
    default:
      return state
  }
}

export const SpreadContainerProvider = ({
  initialItems,
  children,
}: SpreadContainerProviderProps) => {
  const targetRef = useRef()
  const size = useDimensions(targetRef)
  const pageWidth = 680
  const pageHeight = 930
  const pageMargin = 46
  const colWidth = 558
  const ratio = pageWidth / pageHeight

  const conversion = useBreakpointValue(
    {
      base: size.width / pageWidth,
      lg: size.width / 2 / pageWidth,
    },
    // @NOTE: useBreakpointValue renders the fallback first
    { ssr: true } // `ssr: false` produces a window is not defined in nextjs
  )

  /*
  // an attempt to provide a reasonable fallback until useDimensions measures the DOM
  // results in `conversion = 0.5` which causes a visual jump 
  // (I think we prefer hiding the inner children until measurements run)
  const conversion = useBreakpointValue(
    {
      base: size.width ? size.width / pageWidth : pageWidth / pageWidth,
      lg: size.width ? size.width / 2 / pageWidth : pageWidth / 2 / pageWidth,
    },
    // @NOTE: useBreakpointValue renders the fallback first
    { ssr: true, fallback: pageWidth / 2 / pageWidth } // `ssr: false` produces a window is not defined in nextjs
  )
  */

  // Transform the initialItems array into a state object keyed by '_key', including the index
  const initialState: State = {
    items: initialItems.reduce((acc, item, index) => {
      acc[item._key] = {
        index,
        _key: item._key,
        _type: item._type,
        overflowCol: item.overflowCol,
        isOverflowing: false,
      }
      return acc
    }, {} as { [key: string]: Item }),
    order: initialItems.map((item) => item._key),
  }

  const [state, dispatch] = useReducer(spreadContainerReducer, initialState)

  const updateItemsAction = (payload: UpdateItemsPayload) => {
    dispatch({ type: UPDATE_ITEMS, payload })
  }

  const updateItemAction = (payload: UpdateItemPayload) => {
    dispatch({ type: UPDATE_ITEM, payload })
  }

  // @TODO: this is the config for desktop '50% / 2-up display'
  // for base breakpoint these aspect values need to be halved or something

  // const [isLg] = useMediaQuery([MIN_DEFAULT_MQ], {})
  // @NOTE: syntax error issues with the new useMediaQuery hook from chakra-ui v3

  // @TODO: provide isLoading as a function return (like the IdentityProvider)
  // so we can render the modules only after `conversion` is calculated
  const isLoading = isNaN(conversion)

  const value = {
    colWidth,
    conversion, // : isLoading ? 0 : conversion
    isLoading,
    /*spreadAspect: isLg
      ? mapResponsive(ratio, (r) => `${(r / 1) * 100}%`)
      : 'auto',*/
    spreadAspect: mapResponsive(ratio, (r) => `${(r / 1) * 100}%`),
    pageAspect: mapResponsive(ratio, (r) => `${(1 / r) * 100}%`),
    padding: `${pageMargin * conversion}px`,
    state,
    updateItemsAction,
    updateItemAction,
  }

  return (
    <SpreadContainerContext.Provider value={value}>
      <Flex
        // Spread
        w={'80vw'}
        mx={'auto'}
        py={'10vh'}
        pos={'relative'}
        // overflow={'hidden'}
        wrap={'wrap'}
        ref={targetRef}
      >
        {typeof children === 'function' ? children(value) : children}
      </Flex>
    </SpreadContainerContext.Provider>
  )
}
