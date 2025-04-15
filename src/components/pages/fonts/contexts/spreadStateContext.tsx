import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react'
import {
  createUpdateItemAction,
  createUpdateItemsAction,
} from '../reducers/actions'
import { spreadContainerReducer } from '../reducers/spreadReducer'
import {
  Item,
  SpreadStateContextValue,
  SpreadStateProviderProps,
  State,
  UpdateItemPayload,
  UpdateItemsPayload,
} from './types'

// Create context with undefined default value for proper type checking
const SpreadStateContext = createContext<SpreadStateContextValue | undefined>(
  undefined
)

/**
 * SpreadStateProvider - Provides state management for spread layout
 * Optimized with memoization to prevent unnecessary rerenders
 */
export const SpreadStateProvider: React.FC<SpreadStateProviderProps> =
  React.memo(({ initialItems, children }) => {
    // Create initial state from items with memoization
    const initialState = useMemo<State>(
      () => ({
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
      }),
      [initialItems]
    )

    // Use the reducer with our optimized initial state
    const [state, dispatch] = useReducer(spreadContainerReducer, initialState)

    // Memoize action creators to prevent unnecessary rerenders
    const updateItemsAction = useCallback((payload: UpdateItemsPayload) => {
      dispatch(createUpdateItemsAction(payload))
    }, [])

    const updateItemAction = useCallback((payload: UpdateItemPayload) => {
      dispatch(createUpdateItemAction(payload))
    }, [])

    // Memoize the context value to prevent unnecessary rerenders
    const stateContextValue = useMemo<SpreadStateContextValue>(
      () => ({
        state,
        updateItemsAction,
        updateItemAction,
      }),
      [state, updateItemsAction, updateItemAction]
    )

    return (
      <SpreadStateContext.Provider value={stateContextValue}>
        {children}
      </SpreadStateContext.Provider>
    )
  })

SpreadStateProvider.displayName = 'SpreadStateProvider'

/**
 * useSpreadState - Hook for consuming the spread state context
 * Provides type-safe access to state and actions
 */
export const useSpreadState = (): SpreadStateContextValue => {
  const context = useContext(SpreadStateContext)

  if (context === undefined) {
    throw new Error('useSpreadState must be used within a SpreadStateProvider')
  }

  return context
}

export default SpreadStateContext
