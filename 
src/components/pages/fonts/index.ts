// Export main container component with optimization
export {
  SpreadContainerProvider,
  useSpreadContainer,
} from './components/SpreadContainer'

// Export both context APIs for granular consumption
export {
  DimensionsProvider,
  SpreadStateProvider,
  useDimensions,
  useSpreadState,
} from './contexts'

// Note: FontContainer and FontWrapper are still exported from their original files

// Export types for external use
export type {
  DimensionsContextValue,
  Item,
  SpreadContainerProviderProps,
  SpreadContainerProviderValue,
  SpreadStateContextValue,
  State,
} from './contexts/types'
