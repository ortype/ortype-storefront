import { Box } from '@chakra-ui/react'

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
    if (placeholder !== entry) {
      // we've got something new, let's add!
      handleUpdateFontTester({ addEntry: true, sessionId: '' })
    } else {
      // eslint-disable-next-line no-console
      console.log(entry, " hasn't truly changed...")
      // let's just free up that input
      handleUpdateFontTester({ addEntry: false, sessionId: '' })
    }
  }

  const handleKeyDown = (event) => {
    const { key } = event
    const keys = ['Escape', 'Tab', 'Enter']
    // @TODO: Escape and Enter key don't force a blur event
    if (keys.indexOf(key) > -1 || event.key === 'Tab') {
      handleBlur()
    }
  }

  const handleFocus = () =>
    handleUpdateFontTester({
      addEntry: false,
      sessionId: sessionStorage.getItem('sessionId'),
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
        />
      ) : (
        <span>{'...'}</span>
      )}
    </Box>
  )
}

export default Editable
