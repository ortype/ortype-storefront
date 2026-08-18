import { Box } from '@chakra-ui/react'
import { useState } from 'react'
import { getTesterSizes } from '../tester-sizing'
import BlinkingCursor from './blinking-cursor'
import TypewriterAnimation from './typewriter-animation'

const Editable = ({
  index,
  entry,
  placeholder,
  fontId,
  variantId,
  handleChange,
  isDisabled,
  handleUpdateFontTester,
  limiter,
  loading,
  table,
  focused,
  setFocused,
  ...props
}) => {
  const [hasInitialized, setHasInitialized] = useState(false)
  // Only trigger animation on initial mount
  const shouldAnimate = !hasInitialized

  // Handle animation completion
  const handleAnimationComplete = () => {
    setHasInitialized(true)
  }

  const handleBlur = () => {
    setFocused(false)
    // no event.target here, as this isn't an input, but we have the value from above
    const trimmedEntry = entry.trim()
    if (placeholder !== trimmedEntry) {
      // we've got something new, let's add!
      handleUpdateFontTester({
        addEntry: true,
        sessionId: sessionStorage.getItem('sessionId'),
        isEditing: '',
      })
    } else {
      // let's just free up that input
      handleUpdateFontTester({ addEntry: false, sessionId: '', isEditing: '' })
    }
  }

  const handleKeyDown = (event) => {
    const { key } = event
    const keys = ['Escape', 'Enter', 'Tab']

    if (keys.includes(key)) {
      if (key === 'Escape' || key === 'Enter') {
        event.preventDefault()
      }
      event.target.blur()
    }
  }

  const handleFocus = () => {
    setFocused(true)
    handleUpdateFontTester({
      addEntry: false,
      sessionId: sessionStorage.getItem('sessionId'),
      isEditing: sessionStorage.getItem('sessionId'),
    })
  }

  return (
    <Box {...props} textAlign={'center'} mt={1} position="relative">
      {!loading ? (
        <>
          {!hasInitialized && shouldAnimate ? (
            // Show TypewriterAnimation during animation phase
            <TypewriterAnimation
              placeholder={placeholder}
              shouldAnimate={shouldAnimate}
              variantId={variantId}
              onAnimationComplete={handleAnimationComplete}
              table={table}
            />
          ) : (
            // Show input component after animation completes
            <Box
              as={'input'}
              animation={limiter ? `nudge` : undefined}
              animationDuration={'0.2s'}
              animationTimingFunction={'ease-in-out'}
              css={{
                textAlign: `center`,
                fontSize: 'inherit',
                lineHeight: 'inherit',
                boxSizing: `border-box`,
                padding: 0,
                background: `transparent`,
                border: `none`,
                width: `100%`,
                display: `block`,
                transition: 'all 0.2s linear',
                [`&:focus`]: {
                  outline: `none`,
                },
              }}
              h={getTesterSizes(table).lineHeight}
              className={variantId}
              tabIndex={index} // Sequential tabIndex for navigating between inputs
              spellCheck={false}
              type="text"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              name="entry"
              placeholder={placeholder}
              value={entry}
              onFocus={handleFocus}
              onChange={handleChange}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              onPaste={(e) => e.preventDefault()}
              {...props}
            />
          )}
        </>
      ) : (
        // Loading state with centered cursor
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height={getTesterSizes(table).lineHeight}
          pos={'relative'}
        >
          <BlinkingCursor
            table={table}
            isVisible={true}
            isLoading={true}
            variantId={variantId}
            right={'50%'}
          />
        </Box>
      )}
    </Box>
  )
}

export default Editable
