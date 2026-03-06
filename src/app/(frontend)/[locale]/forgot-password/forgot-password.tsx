'use client'
import { FloatingLabelInput } from '@/commercelayer/components/ui/floating-label-input'
import { Alert } from '@/components/ui/alert'
import {
  Box,
  Button,
  Card,
  Link as ChakraLink,
  Container,
  Group,
  Heading,
  InputGroup,
  Stack,
  Text,
} from '@chakra-ui/react'
import { yupResolver } from '@hookform/resolvers/yup'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import * as yup from 'yup'

const validationSchema = yup.object().shape({
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required'),
})

interface FormData {
  email: string
}

export default function ForgotPassword() {
  const params = useParams()
  const locale = (params?.locale as string) || 'en'
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const form = useForm<FormData>({
    resolver: yupResolver(validationSchema),
  })

  const isSubmitting = form.formState.isSubmitting

  const onSubmit = form.handleSubmit(async (formData) => {
    setApiError(null)

    try {
      const response = await fetch('/api/password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, locale }),
      })

      const data = await response.json()

      if (!response.ok && !data.success) {
        setApiError(
          data.error || 'Unable to process your request. Please try again.'
        )
        return
      }

      setIsSubmitted(true)
    } catch (error: any) {
      console.error('Password reset error:', error)
      setApiError('Something went wrong. Please try again later.')
    }
  })

  if (isSubmitted) {
    return (
      <Container
        my={6}
        maxW="40rem"
        minH={'40rem'}
        justifyContent={'center'}
        centerContent
        position={'relative'}
      >
        <Heading
          textAlign={'center'}
          fontSize={'2.5rem'}
          fontWeight={'normal'}
          textTransform={'uppercase'}
          mx={'auto'}
          pb={6}
        >
          {`Check your email`}
        </Heading>
        <Card.Root my={2} w={'full'}>
          <Card.Body p={4}>
            <Text textStyle={'md'}>
              {
                "If an account with that email exists, we've sent you a password reset link."
              }
            </Text>
          </Card.Body>
        </Card.Root>
        <Stack gap={4}>
          <Button
            asChild
            size={'2xs'}
            bg={'brand.50'}
            variant={'subtle'}
            borderRadius={'full'}
          >
            <ChakraLink as={Link} href="/">
              Return to homepage
            </ChakraLink>
          </Button>
        </Stack>
      </Container>
    )
  }

  return (
    <Container
      my={6}
      maxW="40rem"
      minH={'40rem'}
      justifyContent={'center'}
      centerContent
      position={'relative'}
    >
      <Heading
        textAlign={'center'}
        fontSize={'2.5rem'}
        fontWeight={'normal'}
        textTransform={'uppercase'}
        mx={'auto'}
        pb={6}
      >
        {`Forgot your password?`}
      </Heading>
      <Card.Root my={2} w={'full'}>
        <Card.Body p={4}>
          <Text textStyle={'md'}>
            {
              "Enter your email address and we'll send you a link to reset your password."
            }
          </Text>
        </Card.Body>
      </Card.Root>
      <FormProvider {...form}>
        <Box as={'form'} w={'full'} onSubmit={onSubmit}>
          <Stack gap={4}>
            <InputGroup
              attached
              w={'full'}
              flex="1"
              endElement={
                <Button
                  variant={'outline'}
                  type="submit"
                  bg={'white'}
                  borderRadius={'full'}
                  size={'xs'}
                  borderColor={'transparent'}
                  fontSize={'xs'}
                  alignSelf={'center'}
                  loading={isSubmitting}
                  loadingText="Sending..."
                  disabled={isSubmitting}
                >
                  Send reset link
                </Button>
              }
            >
              <FloatingLabelInput
                minW={'30rem'}
                name="email"
                label="Email address"
                type="email"
                variant="subtle"
                size="lg"
                fontSize="lg"
                borderRadius={0}
              />
            </InputGroup>

            {apiError && <Alert status="error">{apiError}</Alert>}
            <Group gap={2} justifyContent={'center'}>
              <Text textStyle={'xs'} textAlign="center">
                Remember your password?{' '}
              </Text>
              <Button
                asChild
                size={'2xs'}
                bg={'brand.50'}
                variant={'subtle'}
                borderRadius={'full'}
              >
                <ChakraLink as={Link} href="/">
                  Sign in
                </ChakraLink>
              </Button>
            </Group>
          </Stack>
        </Box>
      </FormProvider>
    </Container>
  )
}
