'use client'
import { SignUpForm } from '@/commercelayer/components/forms/SignUpForm'
import { useIdentityContext } from '@/commercelayer/providers/identity'
import {
  Box,
  Button,
  Center,
  Link as ChakraLink,
  Container,
  Group,
  Heading,
  Spinner,
  Text,
} from '@chakra-ui/react'
import { useRouter } from 'next/navigation'

export default function RegisterUser() {
  const { isLoading, settings, customer } = useIdentityContext()
  const router = useRouter()
  const onSuccess = () => {
    // redirect to account
    router.push('/account')
  }

  const handleLoginClick = () => {
    router.push('/login')
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
        <Box inset='0' minH={16}>
          <Center h='full'>
            <Spinner color='black' size={'xl'} />
          </Center>
        </Box>
      </Container>
    )
  }

  // Loading IdentityProvider settings are valid?
  if (!settings?.isValid) {
    return <div>Application error (Commerce Layer).</div>
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
          {`Register`}
        </Heading>
        <SignUpForm emailAddress={customer.email} onSuccess={onSuccess} />
        <Group my={2} gap={2} justifyContent={'center'}>
          <Text textStyle={'xs'} textAlign='center'>
            Already registered?
          </Text>
          <Button
            size={'2xs'}
            bg={'brand.50'}
            variant={'subtle'}
            borderRadius={'full'}
            onClick={handleLoginClick}
          >
            {'Login'}
          </Button>
        </Group>
      </Container>
    </>
  )
}
