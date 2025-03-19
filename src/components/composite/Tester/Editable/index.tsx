import { ActionBar, Box, Kbd, Portal, Text } from '@chakra-ui/react'
import { useState } from 'react'
import TypingIndicator from '../TypingIndicator'

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
  ...props
}) => {
  // const typing = useTypewriter(entry);
  const [focused, setFocused] = useState(false)
  const handleBlur = () => {
    setFocused(false)
    // no event.target here, as this isn't an input, but we have the value from above
    const trimmedEntry = entry.trim()
    if (placeholder !== trimmedEntry) {
      // we've got something new, let's add!
      console.log(trimmedEntry, " we've got something new, let's add!")
      handleUpdateFontTester({
        addEntry: true,
        sessionId: sessionStorage.getItem('sessionId'),
        isEditing: '',
      })
    } else {
      // eslint-disable-next-line no-console
      console.log(trimmedEntry, " hasn't truly changed...")
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
    <Box {...props} textAlign={'center'} mt={1}>
      {!isDisabled ? (
        <Box
          animation={limiter ? `nudge` : undefined}
          animationDuration={'0.2s'}
          animationTimingFunction={'ease-in-out'}
          as={'input'}
          css={{
            textAlign: `center`,
            fontSize: `8rem`,
            lineHeight: `12.5rem`,
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
          className={variantId}
          tabIndex={index} // Sequential tabIndex for navigating between inputs
          spellCheck={false}
          type="text"
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
      ) : (
        <TypingIndicator />
      )}
      <ActionBar.Root open={focused} closeOnInteractOutside={false} size={'sm'}>
        <Portal>
          <ActionBar.Positioner>
            <ActionBar.Content>
              <ActionBar.SelectionTrigger>
                {`${entry.length}/10 characters`}
              </ActionBar.SelectionTrigger>
              <ActionBar.Separator />
              <Text fontSize={'sm'}>
                Press <Kbd size={'sm'}>return</Kbd> or{' '}
                <Kbd size={'sm'}>esc</Kbd> to exit and{' '}
                <Kbd size={'sm'}>tab</Kbd> for next
              </Text>
            </ActionBar.Content>
          </ActionBar.Positioner>
        </Portal>
      </ActionBar.Root>
    </Box>
  )
}

export default Editable
