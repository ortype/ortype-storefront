import { Tag as ChakraTag } from '@chakra-ui/react'
import * as React from 'react'

export interface TagProps extends ChakraTag.RootProps {
  startElement?: React.ReactNode
  endElement?: React.ReactNode
  onClose?: VoidFunction
  closable?: boolean
}

export const Tag = React.forwardRef<HTMLSpanElement, TagProps>(function Tag(
  props,
  ref
) {
  const {
    startElement,
    endElement,
    onClose,
    closable = !!onClose,
    children,
    ...rest
  } = props

  const handleOnClick = () => {
    if (closable && onClose) onClose()
  }

  return (
    <ChakraTag.Root
      ref={ref}
      {...rest}
      cursor={closable ? 'pointer' : 'default'}
      onClick={handleOnClick}
      borderRadius={'0px'}
      _hover={{
        borderRadius: '100px',
      }}
      transition={'border-radius 200ms ease-out'}
    >
      {startElement && (
        <ChakraTag.StartElement>{startElement}</ChakraTag.StartElement>
      )}
      <ChakraTag.Label>{children}</ChakraTag.Label>
      {endElement && <ChakraTag.EndElement>{endElement}</ChakraTag.EndElement>}
      {closable && (
        <ChakraTag.EndElement>
          <ChakraTag.CloseTrigger cursor={'pointer'} />
        </ChakraTag.EndElement>
      )}
    </ChakraTag.Root>
  )
})
