import { Box } from '@chakra-ui/react'
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
  ...props
}) => {
  // const typing = useTypewriter(entry);
  const handleBlur = () => {
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

  const handleFocus = () =>
    handleUpdateFontTester({
      addEntry: false,
      sessionId: sessionStorage.getItem('sessionId'),
      isEditing: sessionStorage.getItem('sessionId'),
    })

  return (
    <Box {...props} textAlign={'center'} mt={1}>
      {!isDisabled ? (
        <Box
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
          tabIndex={index}
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
          maxLength={10}
          {...props}
        />
      ) : (
        <TypingIndicator />
      )}
    </Box>
  )
}

export default Editable
