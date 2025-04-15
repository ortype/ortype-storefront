import { Flex } from '@chakra-ui/react'
import React, { useRef } from 'react'
import { DimensionsProvider } from '../contexts/dimensionsContext'
import { SpreadStateProvider } from '../contexts/spreadStateContext'
import { SpreadContainerProviderProps } from '../contexts/types'

/**
 * SpreadContainerProvider - The main component for spread layout management
 * Combines dimensions and state providers
 */

export const SpreadContainerProvider: React.FC<SpreadContainerProviderProps> =
  React.memo(({ initialItems, children }) => {
    // Create ref for dimensions measuring
    const targetRef = useRef<HTMLDivElement>(null)

    return (
      <DimensionsProvider targetRef={targetRef}>
        <SpreadStateProvider initialItems={initialItems}>
          <Flex
            // Spread
            w={'80vw'}
            mx={'auto'}
            py={'10vh'}
            pos={'relative'}
            wrap={'wrap'}
            ref={targetRef}
          >
            {children}
          </Flex>
        </SpreadStateProvider>
      </DimensionsProvider>
    )
  })

SpreadContainerProvider.displayName = 'SpreadContainerProvider'
