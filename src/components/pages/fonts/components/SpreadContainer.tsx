import { Box, Flex } from '@chakra-ui/react'
import React, { useRef } from 'react'
import { useDimensions } from '../contexts/dimensionsContext'
import { SpreadStateProvider } from '../contexts/spreadStateContext'
import { SpreadContainerProviderProps } from '../contexts/types'

/**
 * SpreadContainerProvider - The main component for spread layout management
 * Combines dimensions and state providers
 */

// Type definitions for better TypeScript support
interface DoublePageProps {}

const DoublePage: React.FC<DoublePageProps> = ({ ...props }) => {
  const { spreadAspect, conversion, pageAspect, padding } = useDimensions()
  const isSpread = true

  return (
    <Box
      className={'spread-page'}
      flex={{ base: '0 0 100%', lg: isSpread ? '0 0 100%' : '0 0 50%' }} // responsive values
      mb={padding}
      position="relative"
      // the before creates the height
      _before={{
        height: 0,
        content: `""`,
        display: 'block',
        paddingBottom: { base: 0, lg: isSpread ? spreadAspect : pageAspect },
      }}
      {...props}
    >
      <Flex
        // @TODO: how to best make the w, h, top, left, bottom, right, etc. media query conditional
        w={{ base: 'auto', lg: '100%' }}
        h={{ base: 'auto', lg: '100%' }}
        bg={'#FFF'}
        position={{ base: 'relative', lg: 'absolute' }}
        top={{ base: 'auto', lg: 0 }}
        left={{ base: 'auto', lg: 0 }}
        bottom={{ base: 'auto', lg: 0 }}
        right={{ base: 'auto', lg: 0 }}
        wrap={'nowrap'}
        direction={'column'}
        alignContent={'flex-start'}
        style={{
          padding,
          fontSize: 25 * conversion + 'px',
          lineHeight: 36 * conversion + 'px',
        }}
        overflow={'hidden'}
      ></Flex>
      <Box
        className={'page-divider'}
        css={{
          position: 'absolute',
          width: '2px',
          background: '#C6C6C6',
          height: '100%',
          pointerEvents: 'none',
          top: 0,
        }}
        zIndex={'base'}
        style={{
          right: !isSpread && 0,
          left: isSpread && '50%',
        }}
      />
    </Box>
  )
}

export const SpreadContainerProvider: React.FC<SpreadContainerProviderProps> =
  React.memo(({ initialItems, children }) => {
    // Create ref for dimensions measuring
    const { isLoading } = useDimensions()
    if (isLoading) {
      return <DoublePage />
    }

    return (
      initialItems.length > 0 && (
        <SpreadStateProvider initialItems={initialItems}>
          {children}
        </SpreadStateProvider>
      )
    )
  })

SpreadContainerProvider.displayName = 'SpreadContainerProvider'
