import type { ButtonProps } from '@chakra-ui/react'
import { IconButton as ChakraIconButton } from '@chakra-ui/react'
import { CloseIcon } from '@sanity/icons'
import * as React from 'react'

export type CloseButtonProps = ButtonProps

export const CloseButton = React.forwardRef<
  HTMLButtonElement,
  CloseButtonProps
>(function CloseButton(props, ref) {
  return (
    <ChakraIconButton
      variant="subtle"
      rounded={'full'}
      px={0}
      minWidth={'3rem'}
      w={'3rem'}
      bg={'brand.50'}
      _hover={{ bg: 'black', color: 'white' }}
      aria-label="Close"
      css={{
        '& svg': { width: '3rem', height: '3rem' },
      }}
      ref={ref}
      {...props}
    >
      {props.children ?? <CloseIcon width={'4rem'} height={'4rem'} />}
    </ChakraIconButton>
  )
})
