import { useCustomerContext } from '@/commercelayer/providers/customer'
import {
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  PasswordInput,
  PasswordStrengthMeter,
} from '@/components/ui/password-input'
import { Alert } from '@/components/ui/alert'
import {
  Box,
  Button,
  ButtonGroup,
  Field,
  Input,
  InputGroup,
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
      await updateCustomer?.({ password: data.customerPassword })
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
      <DialogRoot
        lazyMount
        open={editing}
        onOpenChange={(e) => {
          if (!e.open) handleClose()
          else setEditing(true)
        }}
      >
        <DialogContent borderRadius={'2rem'}>
          <DialogHeader>
            <DialogTitle
              textAlign={'center'}
              fontSize={'2rem'}
              fontWeight={'normal'}
              textTransform={'uppercase'}
              mx={'auto'}
              pb={4}
            >
              {'Choose new password'}
            </DialogTitle>
          </DialogHeader>
          <DialogBody>
            <FormProvider {...form}>
              <form
                onSubmit={(e) => {
                  void onSubmit(e)
                }}
              >
                <Stack gap={4}>
                  <PasswordInput name="customerPassword" label="Password" />
                  <PasswordInput
                    name="customerConfirmPassword"
                    label="Confirm Password"
                  />
                  <Box w={'50%'}>
                    <PasswordStrengthMeter value={passwordStrength} py={1} />
                  </Box>
                  {form.formState.errors.root && (
                    <Alert status="error">
                      {form.formState.errors.root.message}
                    </Alert>
                  )}
                  <ButtonGroup
                    gap={1}
                    variant={'outline'}
                    size={'sm'}
                    fontSize={'md'}
                  >
                    <Button
                      borderRadius={'5rem'}
                      bg={'colorPalette.fg'}
                      color={'colorPalette.bg'}
                      type="submit"
                      loading={isSubmitting}
                    >
                      Save
                    </Button>
                    <Button
                      bg={'white'}
                      borderRadius={'5rem'}
                      onClick={handleClose}
                    >
                      Cancel
                    </Button>
                  </ButtonGroup>
                </Stack>
              </form>
            </FormProvider>
          </DialogBody>
        </DialogContent>
      </DialogRoot>
      <Field.Root w="full" pos="relative">
        <InputGroup
          attached
          w={'full'}
          flex="1"
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
