'use client'

import {
  Button,
  Toaster as ChakraToaster,
  Portal,
  Spinner,
  Stack,
  Toast,
  createToaster,
} from '@chakra-ui/react'

export const toaster = createToaster({
  placement: 'bottom',
  pauseOnPageIdle: true,
  overlap: true,
  offsets: {
    left: '1rem',
    top: '1rem',
    right: '1rem',
    bottom: '1rem',
  },
})

export const Toaster = () => {
  return (
    <Portal>
      <ChakraToaster toaster={toaster} insetInline={{ mdDown: '4' }}>
        {(toast) => {
          // console.log({ toast }, toast.meta?.closable)
          return (
            <Toast.Root width={{ md: 'xs' }}>
              {toast.type === 'loading' ? (
                <Spinner size='sm' color='blue.solid' />
              ) : (
                <Toast.Indicator />
              )}
              <Stack gap='0.5' flex='1' maxWidth='100%'>
                {toast.title && <Toast.Title>{toast.title}</Toast.Title>}
                {toast.description && (
                  <Toast.Description>{toast.description}</Toast.Description>
                )}
              </Stack>
              {toast.action && (
                <Toast.ActionTrigger asChild>
                  <Button
                    variant='text'
                    size='xs'
                    fontSize='xs'
                    px={2}
                    py={1}
                    h='auto'
                    minH='auto'
                  >
                    {toast.action.label}{' '}
                  </Button>
                </Toast.ActionTrigger>
              )}
              {toast.closable && <Toast.CloseTrigger />}
            </Toast.Root>
          )
        }}
      </ChakraToaster>
    </Portal>
  )
}
