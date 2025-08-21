import { State, UpdateItemPayload, UpdateItemsPayload } from '../contexts/types'
import {
  SpreadAction,
  UPDATE_ITEM,
  UPDATE_ITEMS,
  isUpdateItemAction,
  isUpdateItemsAction,
} from './actions'

/**
 * Update a single item's properties in state
 * Optimized to return original state if no change is needed
 */
export const updateItem = (state: State, payload: UpdateItemPayload): State => {
  const { _key, isOverflowing, index } = payload

  // Return early if item doesn't exist
  if (!state.items[_key]) return state

  // Get the current item
  const currentItem = state.items[_key]

  // Return original state if no change is needed
  if (
    currentItem.isOverflowing === isOverflowing &&
    (index === undefined || currentItem.index === index)
  ) {
    return state
  }

  // Update only the necessary properties
  return {
    ...state,
    items: {
      ...state.items,
      [_key]: {
        ...currentItem,
        isOverflowing,
        index: index ?? currentItem.index,
      },
    },
  }
}

/**
 * Update indexes of items after a specific item when it becomes overflowing
 * Optimized to return original state when no update is needed
 */
export const updateItems = (
  state: State,
  payload: UpdateItemsPayload
): State => {
  const { order } = state
  const { _key, isOverflowing } = payload

  // Early return if not overflowing (no need to update indexes)
  if (!isOverflowing) return state

  // Find the index of the current item in the order array
  const itemIndex = order.indexOf(_key)
  if (itemIndex === -1 || itemIndex === order.length - 1) {
    // Item not found or is the last item (nothing to update after it)
    return state
  }

  // Create a new state object
  const newState = { ...state, items: { ...state.items } }

  // Update indexes for items after the current one
  for (let j = itemIndex + 1; j < order.length; j++) {
    const nextKey = order[j]
    newState.items[nextKey] = {
      ...newState.items[nextKey],
      index: newState.items[nextKey].index + 1,
    }
  }

  return newState
}

/**
 * Main reducer for SpreadContainer state
 * Handles all state update actions with type-safety
 */
export const spreadContainerReducer = (
  state: State,
  action: SpreadAction
): State => {
  // Use the type guards for better type inference
  if (isUpdateItemsAction(action)) {
    return updateItems(state, action.payload)
  }

  if (isUpdateItemAction(action)) {
    return updateItem(state, action.payload)
  }

  // Add as a fallback for type safety
  return state
}
