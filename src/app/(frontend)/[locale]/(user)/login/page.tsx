'use client'
import { LoginForm } from '@/commercelayer/components/forms/LoginForm'
import { useIdentityContext } from '@/commercelayer/providers/identity'
import {
  Box,
  Button,
  ButtonGroup,
  Center,
  Link as ChakraLink,
  Container,
  Heading,
  Spinner,
} from '@chakra-ui/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function LoginUser() {
  const { isLoading, settings, config, customer } = useIdentityContext()
  const { resetPasswordUrl } = config
  const router = useRouter()

  // redirect to home if we are already logged in
  useEffect(() => {
    if (customer.userMode) {
      router.push('/')
    }
  }, [])

  const onSuccess = () => {
    router.push('/account')
  }

  const handleRegisterClick = () => {
    router.push('/register')
  }

  // Loading IdentityProvider settings
  if (isLoading) {
    return (
      <Container
        my={6}
        maxW={'30rem'}
        minH={'40rem'}
        justifyContent={'center'}
        centerContent
        position={'relative'}
      >
        <Box inset="0" minH={16}>
          <Center h="full">
            <Spinner color="black" size={'xl'} />
          </Center>
        </Box>
      </Container>
    )
  }

  // Loading IdentityProvider settings are valid?
  if (!settings?.isValid) {
    return <div>Application error (Commerce Layer).</div>
  }

  if (!settings.isGuest) {
    return (
      <Container
        my={6}
        maxW={'30rem'}
        minH={'40rem'}
        justifyContent={'center'}
        centerContent
        position={'relative'}
      >
        <Heading
          textAlign={'center'}
          fontSize={'2.5rem'}
          lineHeight={1}
          fontWeight={'normal'}
          textTransform={'uppercase'}
          mx={'auto'}
          pb={6}
        >
          {`Redirecting...`}
        </Heading>
      </Container>
    )
  }

  return (
    <>
      <Container
        my={6}
        maxW={'30rem'}
        minH={'40rem'}
        justifyContent={'center'}
        centerContent
        position={'relative'}
      >
        <Heading
          textAlign={'center'}
          fontSize={'2.5rem'}
          lineHeight={1}
          fontWeight={'normal'}
          textTransform={'uppercase'}
          mx={'auto'}
          pb={6}
        >
          {`Login`}
        </Heading>
        <LoginForm emailAddress={customer.email} onSuccess={onSuccess} />
        <ButtonGroup my={4} gap={1} variant={'subtle'}>
          {resetPasswordUrl.length > 0 && (
            <Button
              asChild
              size={'2xs'}
              bg={'brand.50'}
              variant={'subtle'}
              borderRadius={'full'}
            >
              <ChakraLink
                target="_blank"
                as={Link}
                href={`${resetPasswordUrl}`}
              >
                Forgot password?
              </ChakraLink>
            </Button>
          )}
          <Button
            variant={'outline'}
            borderRadius={'full'}
            size={'2xs'}
            bg={'black'}
            color={'white'}
            _hover={{ bg: 'white', color: 'black' }}
            onClick={handleRegisterClick}
          >
            {'Register'}
          </Button>
        </ButtonGroup>
      </Container>
    </>
  )
}
