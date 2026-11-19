import type { ReactNode, RefObject } from 'react'
import type { FontModule } from '../font-sections'

export type SpreadModule = Pick<FontModule, '_key' | '_type'> & {
  overflowCol?: boolean
}

// Size type definition used for dimension measurements
export interface Size {
  width?: number
  height?: number
}

// Item definition for spread layout
export interface Item {
  _key: string
  _type: FontModule['_type']
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
  spreadAspectValue: string
  spreadAspect: string
  pageAspect: string
  padding: string
  marginBottom: string
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
  initialItems: SpreadModule[]
  children: ReactNode
}

// Individual Context Provider Props
export interface DimensionsProviderProps {
  targetRef: RefObject<HTMLDivElement | null>
  // Exact two-page geometry for scoped module layouts; leave header defaults.
  spreadLayout?: boolean
  children: ReactNode
}

export interface SpreadStateProviderProps {
  initialItems: SpreadModule[]
  children: ReactNode
}
