import { ReactNode } from 'react'

// Size type definition used for dimension measurements
export interface Size {
  width?: number
  height?: number
}

// Item definition for spread layout
export interface Item {
  _key: string
  _type: string
  overflowCol: boolean
  index: number
  isOverflowing: boolean
}

// State structure
export interface State {
  items: { [key: string]: Item }
  order: string[] // Array to keep the order of ids
}

// Action payloads
export interface UpdateItemsPayload {
  _key: string
  isOverflowing: boolean
}

export interface UpdateItemPayload {
  _key: string
  isOverflowing: boolean
  overflowCol?: boolean
  index?: number
}

export type Payload = UpdateItemsPayload | UpdateItemPayload

export interface Action {
  type: string
  payload: Payload
}

// Separate Context Interfaces - Used by individual context providers
export interface DimensionsContextValue {
  conversion: number
  colWidth: number
  spreadAspect: string
  pageAspect: string
  padding: string
  isLoading: boolean
  size: Size
}

export interface SpreadStateContextValue {
  state: State
  updateItemsAction: (payload: UpdateItemsPayload) => void
  updateItemAction: (payload: UpdateItemPayload) => void
}

// Provider Props - Used for component function signatures
export interface SpreadContainerProviderProps {
  initialItems: Item[]
  children: ReactNode
}

// Individual Context Provider Props
export interface DimensionsProviderProps {
  targetRef: React.RefObject<any>
  children: ReactNode
}

export interface SpreadStateProviderProps {
  initialItems: Item[]
  children: ReactNode
}

