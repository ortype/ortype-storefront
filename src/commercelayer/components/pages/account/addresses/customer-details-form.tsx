'use client'

import { FloatingLabelInput } from '@/commercelayer/components/ui/floating-label-input'
import { useCustomerContext } from '@/commercelayer/providers/customer'
import { useIdentityContext } from '@/commercelayer/providers/identity'
import {
  Box,
  Button,
  ButtonGroup,
  Card,
  Field,
  Flex,
  Heading,
  Input,
  InputGroup,
  Stack,
} from '@chakra-ui/react'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import ChangePassword from './change-password'

interface CustomerDetailsValues {
  full_name: string
  company_name: string
  email: string
}

const inputProps = {
  variant: 'subtle' as const,
  size: 'lg' as const,
  fontSize: 'md',
  borderRadius: 0,
}

export function CustomerDetailsForm() {
  const { customers, updateCustomer } = useCustomerContext()
  const { fetchCustomerHandle } = useIdentityContext()

  const {
    control,
    handleSubmit,
    reset,
    formState: { isDirty, isSubmitting },
  } = useForm<CustomerDetailsValues>({
    defaultValues: {
      full_name: '',
      company_name: '',
      email: '',
    },
  })

  // Sync form when customer data loads or updates (e.g. after save)
  useEffect(() => {
    if (customers) {
      reset(
        {
          full_name: customers.metadata?.full_name ?? '',
          company_name: customers.metadata?.company_name ?? '',
          email: customers.email ?? '',
        },
        { keepDirty: false }
      )
    }
  }, [customers, reset])

  const onSubmit = handleSubmit(async (data) => {
    await updateCustomer?.({
      email: data.email,
      metadata: {
        ...customers?.metadata,
        full_name: data.full_name,
        company_name: data.company_name,
      },
    })

    customers && fetchCustomerHandle(customers.id)
  })

  return (
    <Stack gap={2} w={'full'}>
      <Box
        px={3}
        fontSize={'xs'}
        textTransform={'uppercase'}
        color={'#737373'}
        // mb={2}
        asChild
      >
        <Flex gap={1} alignItems={'center'}>
          {'Your details'}
        </Flex>
      </Box>
      <Stack direction="column" gap={2} mb={2} w={'full'}>
        <Controller
          name="full_name"
          control={control}
          render={({ field }) => (
            <FloatingLabelInput
              label={'Name'}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              {...inputProps}
            />
          )}
        />
        <Controller
          name="company_name"
          control={control}
          render={({ field }) => (
            <FloatingLabelInput
              label={'Company name / Studio'}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              {...inputProps}
            />
          )}
        />
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <FloatingLabelInput
              label={'Email'}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              {...inputProps}
            />
          )}
        />
        {isDirty && (
          <ButtonGroup gap={1} variant={'outline'} size={'sm'} fontSize={'md'}>
            <Button
              borderRadius={'5rem'}
              bg={'colorPalette.fg'}
              color={'colorPalette.bg'}
              onClick={onSubmit}
              loading={isSubmitting}
            >
              Save
            </Button>
            <Button bg={'white'} borderRadius={'5rem'} onClick={() => reset()}>
              Cancel
            </Button>
          </ButtonGroup>
        )}
      </Stack>
      <Stack gap={2} my={2} w={'full'}>
        <ChangePassword />
      </Stack>
    </Stack>
  )
}
