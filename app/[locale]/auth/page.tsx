'use client'
import {
  Box,
  Button,
  ButtonGroup,
  Divider,
  Heading,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from '@chakra-ui/react'

import { LockIcon, UnlockIcon } from '@sanity/icons'

import {
  Authorizer,
  AuthorizerBasicAuthLogin,
  AuthorizerForgotPassword,
  AuthorizerResetPassword,
  useAuthorizer,
} from '@authorizerdev/authorizer-react'

interface PageProps {}

// @TODO: use the hook and charka components to build login form
const LoginForm: React.FC<{}> = ({}) => {
  return (
    <>
      <AuthorizerBasicAuthLogin />
    </>
  )
}

// @TODO
const ForgotForm: React.FC<{}> = ({}) => {
  return (
    <>
      <Divider />
      <Heading size="md" pt={4}>
        {'Forgot password?'}
      </Heading>
      <AuthorizerForgotPassword />
    </>
  )
}

// @TODO
const ResetForm: React.FC<{}> = ({}) => {
  return (
    <>
      <Heading size="md" pt={4}>
        {'Reset password'}
      </Heading>
      <AuthorizerResetPassword />
    </>
  )
}

export default function AuthPage(props: PageProps) {
  const { token, user, logout, loading } = useAuthorizer()
  return (
    <Box>
      <IconButton
        variant={'outline'}
        colorScheme={token ? 'green' : 'red'}
        icon={
          token ? (
            <UnlockIcon width={'1.5rem'} height={'1.5rem'} />
          ) : (
            <LockIcon width={'1.5rem'} height={'1.5rem'} />
          )
        }
      />
      <h2>{user ? user.email : 'Not logged in'}</h2>
      {user ? (
        <Button variant={'outline'} onClick={logout}>
          {'Logout'}
        </Button>
      ) : (
        <>
          <LoginForm />
          <ForgotForm />
          <ResetForm />
        </>
      )}
    </Box>
  )
}
