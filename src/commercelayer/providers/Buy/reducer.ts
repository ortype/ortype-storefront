import { AppStateData } from '@/commercelayer/providers/Buy'
import { Order } from '@commercelayer/sdk'
export enum ActionType {
  START_LOADING = 'START_LOADING',
  STOP_LOADING = 'STOP_LOADING',
  ADD_LINE_ITEM = 'ADD_LINE_ITEM',
}

export type Action =
  | { type: ActionType.START_LOADING }
  | { type: ActionType.STOP_LOADING }
  | {
      type: ActionType.ADD_LINE_ITEM
      payload: {
        order: Order
      }
    }

export function reducer(state: AppStateData, action: Action): AppStateData {
  switch (action.type) {
    case ActionType.START_LOADING:
      return {
        ...state,
        isLoading: true,
      }
    case ActionType.STOP_LOADING:
      return {
        ...state,
        isLoading: false,
      }
    case ActionType.ADD_LINE_ITEM: {
      return {
        ...state,
        order: action.payload.order,
        isLoading: false,
      }
    }
    default:
      throw new Error(`Unknown action type`)
  }
}
