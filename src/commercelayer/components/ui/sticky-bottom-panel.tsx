'use client'

import { Box, VStack } from '@chakra-ui/react'
import { motion, useInView } from 'framer-motion'
import { ReactNode, useEffect, useRef, useState } from 'react'

const MotionVStack = motion(VStack)

interface RenderProps {
  isExpanded: boolean
  toggleBox: () => void
}

interface StickyBottomPanelProps {
  /** Render prop for main content - receives isExpanded and toggleBox */
  children: (props: RenderProps) => ReactNode
  /** Render prop for footer content (optional) */
  footer?: (props: RenderProps) => ReactNode
  /** Whether to show the footer - when false, footer won't render or animate */
  showFooter?: boolean
  /** Max width of the panel */
  maxW?: string
  /** Horizontal padding */
  px?: number
  /** Bottom padding */
  pb?: number
  /** Gap between children */
  gap?: number
}

/**
 * A sticky bottom panel that:
 * - Sticks to the bottom of the viewport
 * - Measures its content to create appropriate scroll space (sentinel)
 * - Auto-expands/collapses based on scroll position
 * - Supports an optional footer that slides in/out
 * - Uses framer-motion for smooth animations
 *
 * Uses render props to expose isExpanded and toggleBox to children.
 *
 * @example
 * ```tsx
 * <StickyBottomPanel
 *   footer={(props) => <StepPlaceOrder />}
 *   showFooter={isOnPaymentStep}
 * >
 *   {({ isExpanded, toggleBox }) => (
 *     <OrderSummary isOpen={isExpanded} toggleBox={toggleBox} />
 *   )}
 * </StickyBottomPanel>
 * ```
 */
export function StickyBottomPanel({
  children,
  footer,
  showFooter = false,
  maxW = '50rem',
  px = 8,
  pb = 2,
  gap = 2,
}: StickyBottomPanelProps) {
  const sentinelRef = useRef<HTMLDivElement>(null)
  const measurerRef = useRef<HTMLDivElement>(null)
  const footerMeasurerRef = useRef<HTMLDivElement>(null)

  const [expandedHeight, setExpandedHeight] = useState(0)
  const [footerHeight, setFooterHeight] = useState(0)
  const [isMeasurementReady, setIsMeasurementReady] = useState(false)
  const [manualOverride, setManualOverride] = useState<boolean | null>(null)

  // Measure the always-expanded content to get consistent height for sentinel
  useEffect(() => {
    if (!measurerRef.current) return

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setExpandedHeight(entry.contentRect.height)
      }
    })

    resizeObserver.observe(measurerRef.current)
    return () => resizeObserver.disconnect()
  }, [])

  // Measure footer height for slide offset (always rendered ghost)
  useEffect(() => {
    if (!footerMeasurerRef.current) return

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setFooterHeight(entry.contentRect.height)
      }
    })

    resizeObserver.observe(footerMeasurerRef.current)
    return () => resizeObserver.disconnect()
  }, [])

  // Wait one frame after measurement for IntersectionObserver to recalculate
  useEffect(() => {
    if (expandedHeight > 0 && !isMeasurementReady) {
      requestAnimationFrame(() => {
        setIsMeasurementReady(true)
      })
    }
  }, [expandedHeight, isMeasurementReady])

  // useInView with dynamic margin based on content height
  const isInView = useInView(sentinelRef, {
    margin: `0px 0px -${expandedHeight}px 0px`,
  })

  // Clear manual override when scroll behavior takes over (isInView changes)
  useEffect(() => {
    if (isMeasurementReady && manualOverride !== null) {
      setManualOverride(null)
    }
  }, [isInView]) // eslint-disable-line react-hooks/exhaustive-deps

  const toggleBox = () => {
    setManualOverride((prev) => {
      const newValue = prev === null ? true : !prev
      // Scroll to bottom when manually expanding
      if (newValue) {
        setTimeout(() => {
          window.scrollTo({
            top: document.body.scrollHeight,
            behavior: 'smooth',
          })
        }, 50)
      }
      return newValue
    })
  }

  // Expand if: user manually opened OR sentinel is in view (no overlap)
  // Don't trust isInView until measurement is ready
  const isExpanded = isMeasurementReady ? manualOverride ?? isInView : false

  // Render props object
  const renderProps: RenderProps = { isExpanded, toggleBox }

  // Calculate y offset: slide down when collapsed and footer is shown
  const yOffset = showFooter && !isExpanded ? footerHeight + gap * 4 : 0

  return (
    <>
      {/* Invisible measurer - always expanded to get full height */}
      <Box
        ref={measurerRef}
        position="absolute"
        visibility="hidden"
        pointerEvents="none"
        aria-hidden="true"
        w="full"
        maxW={maxW}
        px={px}
      >
        <VStack gap={gap} w="full">
          {children({ isExpanded: true, toggleBox: () => {} })}
          {showFooter && footer?.({ isExpanded: true, toggleBox: () => {} })}
        </VStack>
      </Box>

      {/* Ghost measurer for footer - always rendered for height calculation */}
      {footer && (
        <Box
          ref={footerMeasurerRef}
          position="absolute"
          visibility="hidden"
          pointerEvents="none"
          aria-hidden="true"
          w="full"
          maxW={maxW}
          px={px}
        >
          {footer({ isExpanded: true, toggleBox: () => {} })}
          <Box h={gap} /> {/* Compensate for gap */}
        </Box>
      )}

      {/* Scroll sentinel - uses measured height to reserve space */}
      <Box ref={sentinelRef} h={`${expandedHeight}px`} w="full" mb={pb} />

      {/* Fixed bottom panel */}
      <MotionVStack
        position="fixed"
        bottom={0}
        left={0}
        right={0}
        margin="0 auto"
        px={px}
        pb={pb}
        maxW={maxW}
        gap={gap}
        animate={{ y: yOffset }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        {children(renderProps)}
        {showFooter && footer?.(renderProps)}
      </MotionVStack>
    </>
  )
}
