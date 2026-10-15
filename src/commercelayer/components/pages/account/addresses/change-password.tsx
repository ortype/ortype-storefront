import { useCustomerContext } from '@/commercelayer/providers/customer'
import { Alert } from '@/components/ui/alert'
import { CloseButton } from '@/components/ui/close-button'
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  PasswordInput,
  PasswordStrengthMeter,
} from '@/components/ui/password-input'
import {
  Box,
  Button,
  ButtonGroup,
  Drawer,
  Field,
  Input,
  InputGroup,
  Portal,
  Stack,
} from '@chakra-ui/react'
import { yupResolver } from '@hookform/resolvers/yup'
import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import * as yup from 'yup'

const inputProps = {
  variant: 'subtle' as const,
  size: 'lg' as const,
  fontSize: 'md',
  borderRadius: 0,
}

const validationSchema = yup.object().shape({
  customerPassword: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .test(
      'password-strength',
      'Password must contain uppercase, lowercase, number, and special character',
      (value) => {
        if (!value) return false
        const hasLowercase = /[a-z]/.test(value)
        const hasUppercase = /[A-Z]/.test(value)
        const hasNumber = /\d/.test(value)
        const hasSpecialChar = /[^\w\s]/.test(value)
        return hasLowercase && hasUppercase && hasNumber && hasSpecialChar
      }
    ),
  customerConfirmPassword: yup
    .string()
    .required('Confirm password is required')
    .oneOf([yup.ref('customerPassword'), ''], 'Passwords must match'),
})

interface ChangePasswordValues {
  customerPassword: string
  customerConfirmPassword: string
}

const calculatePasswordStrength = (password: string): number => {
  if (!password) return 0
  let score = 0
  if (password.length >= 8) score++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[^\w\s]/.test(password)) score++
  return score
}

const ChangePassword = () => {
  const [editing, setEditing] = useState(false)
  const { updateCustomer } = useCustomerContext()

  const form = useForm<ChangePasswordValues>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      customerPassword: '',
      customerConfirmPassword: '',
    },
  })

  const { isSubmitting } = form.formState
  const watchedPassword = form.watch('customerPassword')
  const passwordStrength = calculatePasswordStrength(watchedPassword || '')

  const handleClose = () => {
    setEditing(false)
    form.reset()
  }

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await updateCustomer?.({
        password: data.customerPassword,
      })
      handleClose()
    } catch {
      form.setError('root', {
        type: 'custom',
        message: 'Failed to update password. Please try again.',
      })
    }
  })

  return (
    <>
      <Drawer.Root
        lazyMount
        open={editing}
        onOpenChange={(e) => {
          if (!e.open) handleClose()
          else setEditing(true)
        }}
        size={'md'}
        // initialFocusEl={() => ref.current}
      >
        <Portal>
          <Drawer.Backdrop css={{ backdropFilter: 'blur(5px)' }} />
          <Drawer.Positioner
          // p={10}
          >
            <Drawer.Content
              rounded={0}
              // rounded={40}
              p={4}
              bg={'#e7e7e7'}
            >
              <Drawer.CloseTrigger
                position={'absolute'}
                top={'1rem'}
                left={'-4rem'}
                asChild
              >
                <CloseButton size='2xl' />
              </Drawer.CloseTrigger>
              <Drawer.Header pt={2} pb={3}>
                <Drawer.Title
                  fontSize={'2rem'}
                  fontWeight={'normal'}
                  textTransform={'uppercase'}
                  lineHeight={1}
                  pb={3}
                  borderBottom={'1px solid #919191'}
                >
                  {'Choose new password'}
                </Drawer.Title>
              </Drawer.Header>
              <Drawer.Body>
                <FormProvider {...form}>
                  <form
                    onSubmit={(e) => {
                      void onSubmit(e)
                    }}
                  >
                    <Stack gap={4}>
                      <PasswordInput
                        name='customerPassword'
                        label='Password'
                        variant={'white'}
                      />
                      <PasswordInput
                        name='customerConfirmPassword'
                        label='Confirm Password'
                        variant={'white'}
                      />
                      <Box w={'100%'}>
                        <PasswordStrengthMeter
                          value={passwordStrength}
                          py={1}
                        />
                      </Box>
                      {form.formState.errors.root && (
                        <Alert status='error'>
                          {form.formState.errors.root.message}
                        </Alert>
                      )}
                      <ButtonGroup gap={1}>
                        <Button
                          variant='text'
                          size='xs'
                          fontSize='xs'
                          px={2}
                          py={1}
                          h='auto'
                          minH='auto'
                          onClick={handleClose}
                        >
                          Cancel
                        </Button>
                        <Button
                          alignSelf='flex-end'
                          variant={'solid'}
                          bg={'black'}
                          color={'white'}
                          borderRadius={'5rem'}
                          border={'2px solid #000'}
                          size={'sm'}
                          fontSize={'md'}
                          gap={1}
                          _hover={{
                            bg: 'transparent',
                            color: 'colorPalette.fg',
                          }}
                          type='submit'
                          loading={isSubmitting}
                        >
                          Save
                        </Button>
                      </ButtonGroup>
                    </Stack>
                  </form>
                </FormProvider>
              </Drawer.Body>
            </Drawer.Content>
          </Drawer.Positioner>
        </Portal>
      </Drawer.Root>
      <Field.Root w='full' pos='relative'>
        <InputGroup
          attached
          w={'full'}
          flex='1'
          endElement={
            <Button
              onClick={() => setEditing(true)}
              size={'2xs'}
              bg={'white'}
              variant={'subtle'}
              borderRadius={'full'}
            >
              {'Change password'}
            </Button>
          }
        >
          <Input
            {...inputProps}
            value={'************'}
            readOnly
            css={{
              paddingTop: '3',
              paddingBottom: '1',
            }}
          />
        </InputGroup>
        <Field.Label
          css={{
            pos: 'absolute',
            bg: 'transparent',
            px: '0.05rem',
            top: '0',
            insetStart: '3',
            fontWeight: 'normal',
            pointerEvents: 'none',
            color: 'fg',
            fontSize: '2xs',
          }}
        >
          {'Password'}
        </Field.Label>
      </Field.Root>
    </>
  )
}

export default ChangePassword
