import { Button, chakra, type ButtonProps } from '@chakra-ui/react'
import React from 'react'

/**
 * Geometry for the pie sweep.
 *
 * The pie is drawn as a single `<circle>` whose stroke is thick enough to
 * reach the centre (`strokeWidth === diameter of the path`), so animating
 * `stroke-dashoffset` sweeps a solid wedge rather than an arc. Unlike a
 * `conic-gradient`, `stroke-dashoffset` is an interpolatable property, so the
 * fill transitions smoothly without registering a custom `@property`.
 *
 * Starting the path at 12 o'clock (`rotate(-90)`) and letting the dash grow in
 * the SVG's default direction gives a clockwise sweep.
 */
const VIEWBOX = 32
const CENTER = VIEWBOX / 2
const RADIUS = VIEWBOX / 4
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

interface Props extends Omit<ButtonProps, 'value'> {
  /** Fraction of the group that is selected, 0–1 */
  value: number
  /** Colour of the filled wedge */
  fillColor?: string
  /** Colour of the unfilled remainder */
  trackColor?: string
  /** Duration of the fill animation, in ms */
  durationMs?: number
  /**
   * How far the pie bleeds outwards past the button's content box, so its
   * antialiased edge tucks under the border instead of leaving a hairline of
   * background showing between the two curves. Needs to be no larger than the
   * border width, and only reads as an overlap because the wedge and the
   * border are the same colour.
   */
  bleed?: string
}

export const TogglePieButton: React.FC<Props> = ({
  value,
  fillColor = 'black',
  trackColor = 'white',
  durationMs = 300,
  bleed = '1px',
  ...buttonProps
}) => {
  const ratio = Number.isFinite(value) ? Math.min(Math.max(value, 0), 1) : 0

  return (
    <Button
      variant={'circle'}
      p={0}
      bg={trackColor}
      pos={'relative'}
      {...buttonProps}
    >
      <chakra.svg
        aria-hidden={'true'}
        focusable={'false'}
        viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
        pos={'absolute'}
        // Replaced elements don't stretch between opposing `inset` values, so
        // size explicitly: content box + bleed on every side keeps the pie
        // centred at any rem/zoom level.
        top={`calc(${bleed} * -1)`}
        left={`calc(${bleed} * -1)`}
        w={`calc(100% + ${bleed} * 2)`}
        h={`calc(100% + ${bleed} * 2)`}
        pointerEvents={'none'}
        overflow={'visible'}
      >
        <chakra.circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          fill={'none'}
          stroke={fillColor}
          strokeWidth={RADIUS * 2}
          transform={'rotate(-90deg)'}
          transformOrigin={'center'}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - ratio)}
          transition={`stroke-dashoffset ${durationMs}ms ease-in-out`}
          _motionReduce={{ transition: 'none' }}
        />
      </chakra.svg>
    </Button>
  )
}

export default TogglePieButton
