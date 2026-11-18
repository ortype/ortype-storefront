import {
  State,
  UpdateItemPayload,
  UpdateItemsPayload,
  SpreadModule,
} from '../contexts/types'
import {
  SpreadAction,
  RECONCILE_ITEMS,
  isUpdateItemAction,
  isUpdateItemsAction,
} from './actions'

// Rebuild page indices from the current module order, retaining measurements
// for surviving keys. Recomputing avoids accumulated offsets after live edits.
export function reconcileSpreadItems(
  state: State,
  modules: SpreadModule[]
): State {
  let index = 0
  let changed = modules.length !== state.order.length
  const items: State['items'] = {}
  const order = modules.map((module, position) => {
    const previous = state.items[module._key]
    const overflowCol = module.overflowCol ?? false
    const isOverflowing =
      previous?._type === module._type ? previous.isOverflowing : false
    const item = {
      _key: module._key,
      _type: module._type,
      overflowCol,
      isOverflowing,
      index,
    }
    const unchanged =
      previous &&
      previous._type === item._type &&
      previous.overflowCol === overflowCol &&
      previous.isOverflowing === isOverflowing &&
      previous.index === index
    items[module._key] = unchanged ? previous : item
    changed ||= !unchanged || state.order[position] !== module._key
    index +=
      module._type === 'tester' ||
      module._type === 'module.tester' ||
      (isOverflowing && overflowCol)
        ? 2
        : 1
    return module._key
  })
  return changed ? { items, order } : state
}

function reindex(state: State): State {
  return reconcileSpreadItems(
    state,
    state.order.map((key) => state.items[key])
  )
}

/**
 * Update a single item's properties in state
 * Optimized to return original state if no change is needed
 */
export const updateItem = (
  state: State,
  payload: UpdateItemPayload
): State => {
  const { _key, isOverflowing } = payload

  // Return early if item doesn't exist
  if (!state.items[_key]) return state

  // Get the current item
  const currentItem = state.items[_key]

  // Return original state if no change is needed
  if (currentItem.isOverflowing === isOverflowing) {
    return state
  }

  // Update only the necessary properties
  return reindex({
    ...state,
    items: {
      ...state.items,
      [_key]: {
        ...currentItem,
        isOverflowing,
      },
    },
  })
}

/**
 * Keep the existing batched action API; index calculation is idempotent.
 */
export const updateItems = (
  state: State,
  payload: UpdateItemsPayload
): State => {
  return state.items[payload._key] ? reindex(state) : state
}

/**
 * Main reducer for SpreadContainer state
 * Handles all state update actions with type-safety
 */
export const spreadContainerReducer = (
  state: State,
  action: SpreadAction
): State => {
  if (action.type === RECONCILE_ITEMS) {
    return reconcileSpreadItems(state, action.payload)
  }
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
