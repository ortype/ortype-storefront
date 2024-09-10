'use client'
import { disableDraftMode } from '@/app/actions'
import {
  Box,
  Button,
  ButtonGroup,
  Container,
  Heading,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure,
} from '@chakra-ui/react'
import { useRouter } from 'next/navigation'

import {
  AuthorizerBasicAuthLogin,
  AuthorizerForgotPassword,
  AuthorizerResetPassword,
  useAuthorizer,
} from '@authorizerdev/authorizer-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

const ForgotForm: React.FC<{}> = ({}) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const router = useRouter()
  useEffect(() => {
    disableDraftMode().then(() => {
      router.refresh()
    })
  }, [])
  return (
    <>
      <Button size={'sm'} variant={'link'} onClick={onOpen}>
        {'Forgot password?'}
      </Button>
      <Modal isOpen={isOpen} onClose={onClose} size={'lg'}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <Heading size="md" pt={4}>
              {'Forgot password?'}
            </Heading>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <AuthorizerForgotPassword />
          </ModalBody>
          <ModalFooter></ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

const ResetForm: React.FC<{}> = ({}) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  return (
    <>
      <Button size={'sm'} variant={'link'} onClick={onOpen}>
        {'Reset password'}
      </Button>
      <Modal isOpen={isOpen} onClose={onClose} size={'lg'}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <Heading size="md" pt={4}>
              {'Reset password'}
            </Heading>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <AuthorizerResetPassword />
          </ModalBody>
          <ModalFooter></ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

const RefreshPrompt: React.FC<{}> = ({}) => {
  return (
    <>
      <Heading my={'2rem'}>{'Loggin in...'}</Heading>
      <Text size={'md'}>{'redirecting... refresh the page if stuck'}</Text>
    </>
  )
}

const Login: React.FC<{}> = ({}) => {
  const { token, user, logout, authorizerRef } = useAuthorizer()
  const router = useRouter()
  const handleLogin = async (response) => {
    await fetch('/api/login')
    console.log('basicauthlogin response: ', response)
    // https://github.com/authorizerdev/authorizer?tab=readme-ov-file#copy-the-following-code-in-html-file
    // https://docs.authorizer.dev/integrations/react-native#step-10-silent-refresh
    /*const res = await authorizerRef.authorize({
      // {"error":"invalid client_id "}
      response_type: 'code',
      use_refresh_token: true,
    })
    console.log('res: ', res)
    */
    /*
    const res = await authorizerRef.getToken({
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
          })
    */
    setTimeout(() => {
      console.log('waiting... and... calling refresh()')
      router.refresh()
    }, 3000)
  }

  return (
    <Container centerContent h={'100vh'} justifyContent={'center'}>
      <Box minW={'20rem'}>
        {user ? <RefreshPrompt /> : <Heading my={'2rem'}>Log in</Heading>}
        {!token?.access_token && (
          <>
            <AuthorizerBasicAuthLogin onLogin={handleLogin} />
            <ButtonGroup my={'1rem'} spacing={'1rem'}>
              <ForgotForm />
              <ResetForm />
            </ButtonGroup>
          </>
        )}
      </Box>
    </Container>
  )
}

export default Login
