import {
  UpdateItemPayload,
  UpdateItemsPayload,
  SpreadModule,
} from '../contexts/types'

// Action types as constants
export const UPDATE_ITEMS = 'UPDATE_ITEMS'
export const UPDATE_ITEM = 'UPDATE_ITEM'
export const RECONCILE_ITEMS = 'RECONCILE_ITEMS'

// Action types
export interface UpdateItemsAction {
  type: typeof UPDATE_ITEMS
  payload: UpdateItemsPayload
}

export interface UpdateItemAction {
  type: typeof UPDATE_ITEM
  payload: UpdateItemPayload
}

// Union type for all actions
export type SpreadAction =
  | UpdateItemsAction
  | UpdateItemAction
  | {
      type: typeof RECONCILE_ITEMS
      payload: SpreadModule[]
    }

// Action creators
export const createUpdateItemsAction = (
  payload: UpdateItemsPayload
): UpdateItemsAction => ({
  type: UPDATE_ITEMS,
  payload,
})

export const createUpdateItemAction = (
  payload: UpdateItemPayload
): UpdateItemAction => ({
  type: UPDATE_ITEM,
  payload,
})

// Type guards
export const isUpdateItemsAction = (
  action: SpreadAction
): action is UpdateItemsAction => action.type === UPDATE_ITEMS

export const isUpdateItemAction = (
  action: SpreadAction
): action is UpdateItemAction => action.type === UPDATE_ITEM
