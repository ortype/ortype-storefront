// @TODO: consider merging this file with CL's `@/components/utils/constants.ts`

export const BASE_URL = 'https://www.ortype.is'

// em = 16px
export const LARGER_DISPLAY_WIDTH = '100em' // 1600px
export const LARGE_DISPLAY_WIDTH = '77.5em' // 1240px
export const DEFAULT_WIDTH = '64em' // 1024px
export const TABLET_WIDTH = '48em' // 768px
export const MOBILE_WIDTH = '375px' // '30em' // 480px
// below 375 are smaller phones like the iphone5

export const MIN_MEDIA_LARGER_DISPLAY_MQ = `@media (min-width:${LARGER_DISPLAY_WIDTH})`
export const MIN_MEDIA_LARGE_DISPLAY_MQ = `@media (min-width:${LARGE_DISPLAY_WIDTH})`
export const MIN_MEDIA_DEFAULT_MQ = `@media (min-width:${DEFAULT_WIDTH})`
export const MIN_MEDIA_TABLET_MQ = `@media (min-width:${TABLET_WIDTH})`
export const MIN_MEDIA_MOBILE_MQ = `@media (min-width:${MOBILE_WIDTH})`

export const MIN_LARGER_DISPLAY_MQ = `(min-width:${LARGER_DISPLAY_WIDTH})`
export const MIN_LARGE_DISPLAY_MQ = `(min-width:${LARGE_DISPLAY_WIDTH})`
export const MIN_DEFAULT_MQ = `(min-width:${DEFAULT_WIDTH})`
export const MIN_TABLET_MQ = `(min-width:${TABLET_WIDTH})`
export const MIN_MOBILE_MQ = `(min-width:${MOBILE_WIDTH})`

export const BLACK = `#000`
export const WHITE = `#FFF`

// http://easings.net/#easeInOutQuad
export const EASE = [0.455, 0.03, 0.515, 0.955] // `cubic-bezier(0.455, 0.03, 0.515, 0.955)` // easeInOutQuad
export const EASE_CSS = `cubic-bezier(0.455, 0.03, 0.515, 0.955)` // easeInOutQuad
export const EASE_OUT_QUAD = [0.5, 1, 0.89, 1]
export const TIMEOUT = 0.3
export const ZHIGHEST = `1999`
export const ZHIGHER = `98`
export const ZHIGH = `97`

// Framer Motion variants
export const SLIDE_UP = {
  enter: {
    opacity: 1,
    transform: 'translate3d(0,0,0)',
    transition: {
      duration: TIMEOUT,
      ease: EASE,
      delay: TIMEOUT * 2,
    },
  },
  exit: {
    opacity: 0,
    transform: 'translate3d(0,20px,0)',
    transition: {
      duration: TIMEOUT,
      ease: EASE,
    },
  },
}

export const FADE = {
  enter: {
    opacity: 1,
    transition: {
      duration: TIMEOUT,
      ease: EASE,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: TIMEOUT,
      ease: EASE,
    },
  },
}

export const FADE_WITH_DELAY = {
  enter: {
    opacity: 1,
    transition: {
      duration: TIMEOUT,
      ease: EASE,
      delay: TIMEOUT * 2,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: TIMEOUT,
      ease: EASE,
      delay: TIMEOUT,
    },
  },
}
