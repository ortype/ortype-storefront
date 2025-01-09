import {
  Box,
  Button,
  ButtonGroup,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Link,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  SimpleGrid,
  Stack,
  Switch,
  useDisclosure,
} from '@chakra-ui/react'
import Cookies from 'js-cookie'
import React, { useEffect, useState } from 'react'

import { LoginForm } from '@/commercelayer/components/forms/LoginForm'
import { SignUpForm } from '@/commercelayer/components/forms/SignUpForm'
import { getStoredTokenKey } from '@/commercelayer/utils/oauthStorage'
import { useIdentityContext } from '@/commercelayer/providers/Identity'

export const Account = () => {
  const { settings, config, customer, handleLogout } = useIdentityContext()

  const {
    isOpen: isLoginOpen,
    onOpen: onLoginOpen,
    onClose: onLoginClose,
  } = useDisclosure()
  const {
    isOpen: isRegisterOpen,
    onOpen: onRegisterOpen,
    onClose: onRegisterClose,
  } = useDisclosure()

  const handleRegisterClick = () => {
    onLoginClose()
    setTimeout(() => {
      onRegisterOpen()
    }, 500)
  }

  const handleLoginClick = () => {
    onRegisterClose()
    setTimeout(() => {
      onLoginOpen()
    }, 500)
  }

  return (
    <>
      <Button onClick={onLoginOpen} size={'xs'}>
        {settings.customerId ? `Account` : `Login`}
      </Button>
      <Modal isOpen={isRegisterOpen} onClose={onRegisterClose} size={'lg'}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Register</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <SignUpForm />
          </ModalBody>
          <ModalFooter>
            <Button size={'sm'} onClick={handleLoginClick}>
              {'Login'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Modal isOpen={isLoginOpen} onClose={onLoginClose} size={'lg'}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Login</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <LoginForm />
          </ModalBody>
          <ModalFooter>
            <ButtonGroup gap={2}>
              {settings?.customerId && (
                <Button
                  as={Link}
                  href={`/account`}
                  // href={`http://localhost:3001/orders?accessToken=${customerCtx?.accessToken}`}
                  // isExternal
                >
                  {'My account'}
                </Button>
              )}
              {customer?.email ? (
                <Button onClick={handleLogout}>{'Logout'}</Button>
              ) : (
                <Button onClick={handleRegisterClick}>{'Register'}</Button>
              )}
            </ButtonGroup>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
