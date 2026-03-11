import type { ButtonProps } from '@chakra-ui/react'
import { IconButton as ChakraIconButton } from '@chakra-ui/react'
import * as React from 'react'
import { LuX } from 'react-icons/lu'

export type CloseButtonProps = ButtonProps

export const CloseButton = React.forwardRef<
  HTMLButtonElement,
  CloseButtonProps
>(function CloseButton(props, ref) {
  return (
    <ChakraIconButton
      variant="subtle"
      borderRadius={'full'}
      px={0}
      minWidth={'3rem'}
      w={'3rem'}
      bg={'brand.50'}
      aria-label="Close"
      ref={ref}
      {...props}
    >
      {props.children ?? <LuX />}
    </ChakraIconButton>
  )
})
