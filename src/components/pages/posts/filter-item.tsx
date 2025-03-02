import { Tag as ChakraTag } from '@chakra-ui/react'
import * as React from 'react'

export interface TagProps extends ChakraTag.RootProps {
  onClick?: VoidFunction
  closeable: boolean
  active: boolean
}

export const FilterItem = React.forwardRef<HTMLSpanElement, TagProps>(
  function FilterItem(props, ref) {
    const { closeable, onClick, active, children, ...rest } = props

    return (
      <ChakraTag.Root
        ref={ref}
        {...rest}
        variant={active ? 'surface' : 'outline'}
        cursor={'pointer'}
        asChild
      >
        <button onClick={onClick}>
          <ChakraTag.Label>{children}</ChakraTag.Label>
          {closeable && active && (
            <ChakraTag.EndElement>
              <ChakraTag.CloseTrigger as={'span'} />
            </ChakraTag.EndElement>
          )}
        </button>
      </ChakraTag.Root>
    )
  }
)
