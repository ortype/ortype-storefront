'use client'

import { FloatingLabelInput } from '@/commercelayer/components/ui/floating-label-input'
import { useCustomerContext } from '@/commercelayer/providers/customer'
import {
  Button,
  ButtonGroup,
  Heading,
  Stack,
} from '@chakra-ui/react'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'

interface CustomerDetailsValues {
  full_name: string
  company_name: string
  email: string
}

export function CustomerDetailsForm() {
  const { customers, updateCustomer } = useCustomerContext()

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
  })

  const inputProps = {
    variant: 'subtle' as const,
    size: 'lg' as const,
    fontSize: 'md',
    borderRadius: 0,
  }

  return (
    <>
      <Heading
        as={'h5'}
        fontSize={'xl'}
        textTransform={'uppercase'}
        fontWeight={'normal'}
      >
        {'Your details'}
      </Heading>
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
            <Button
              bg={'white'}
              borderRadius={'5rem'}
              onClick={() => reset()}
            >
              Cancel
            </Button>
          </ButtonGroup>
        )}
      </Stack>
      {/* @TODO: Password update — wire up with react-hook-form (confirm field + explicit submit) */}
      <Stack gap={2} my={2} w={'full'}>
        <FloatingLabelInput
          label={'Password'}
          value={'************'}
          readOnly
          {...inputProps}
        />
      </Stack>
    </>
  )
}
