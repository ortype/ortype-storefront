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
      <AuthorizerResetPassword />
    </>
  )
}

const BookAuth: React.FC<{}> = ({}) => {
  const {
    isOpen: isLoginOpen,
    onOpen: onLoginOpen,
    onClose: onLoginClose,
  } = useDisclosure()

  const { token, user, logout, loading } = useAuthorizer()

  return (
    <Box>
      <IconButton
        onClick={onLoginOpen}
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
      <Modal isOpen={isLoginOpen} onClose={onLoginClose} size={'lg'}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{user ? user.email : 'Not logged in'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {user ? (
              <Button variant={'outline'} onClick={logout}>
                {'Logout'}
              </Button>
            ) : (
              <>
                <LoginForm />
              </>
            )}
          </ModalBody>
          <ModalFooter></ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
}

export default BookAuth
