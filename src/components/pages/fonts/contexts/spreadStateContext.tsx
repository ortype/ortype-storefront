import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
} from 'react'
import {
  createUpdateItemAction,
  createUpdateItemsAction,
  RECONCILE_ITEMS,
} from '../reducers/actions'
import {
  spreadContainerReducer,
  reconcileSpreadItems,
} from '../reducers/spreadReducer'
import {
  SpreadStateContextValue,
  SpreadStateProviderProps,
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
    const [storedState, dispatch] = useReducer(
      spreadContainerReducer,
      initialItems,
      (items) => reconcileSpreadItems({ items: {}, order: [] }, items)
    )

    // Reconcile before children render: a newly inserted module must already
    // have state when its overflow detector reads it.
    const state = useMemo(
      () => reconcileSpreadItems(storedState, initialItems),
      [storedState, initialItems]
    )
    if (state !== storedState) {
      dispatch({ type: RECONCILE_ITEMS, payload: initialItems })
    }

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
    throw new Error(
      'useSpreadState must be used within a SpreadStateProvider'
    )
  }

  return context
}

export default SpreadStateContext
