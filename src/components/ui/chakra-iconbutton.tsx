import type { IconButtonProps as ChakraIconButtonProps } from '@chakra-ui/react'
import {
  AbsoluteCenter,
  IconButton as ChakraIconButton,
  Span,
  Spinner,
} from '@chakra-ui/react'
import * as React from 'react'

interface ButtonLoadingProps {
  loading?: boolean
  loadingText?: React.ReactNode
}

export interface ButtonProps
  extends ChakraIconButtonProps,
    ButtonLoadingProps {}

export const IconButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function IconButton(props, ref) {
    const { loading, disabled, loadingText, children, ...rest } = props
    return (
      <ChakraIconButton
        rounded={'full'}
        disabled={loading || disabled}
        ref={ref}
        {...rest}
      >
        <AbsoluteCenter display="inline-flex" axis={'horizontal'}>
          <Span>{children}</Span>
        </AbsoluteCenter>
      </ChakraIconButton>
    )
  }
)
