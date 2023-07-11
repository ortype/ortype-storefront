import {
  Box,
  Button,
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
import CommerceLayer, { CustomerCreate } from '@commercelayer/sdk'
import { CustomerContext } from 'components/data/CustomerProvider'
import { SettingsContext } from 'components/data/SettingsProvider'
import Cookies from 'js-cookie'
import { useRapidForm } from 'rapid-form'
import React, { useContext, useEffect, useState } from 'react'
import { LoginForm } from './LoginForm'
import { RegisterForm } from './RegisterForm'

export const Account = () => {
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
  const customerCtx = useContext(CustomerContext)
  const settingsCtx = useContext(SettingsContext)

  const handleLogout = () => {
    // @TODO: Logout is actually just a state change in the SettingsProvider
    // seems we may need to clear `checkoutAccessToken`
    Cookies.remove('clAccessToken')
    settingsCtx?.handleLogout()
  }

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
      <Button onClick={onLoginOpen}>{`Login`}</Button>
      <Modal isOpen={isRegisterOpen} onClose={onRegisterClose} size={'lg'}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Register</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <RegisterForm emailAddress={''} />
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
            <LoginForm emailAddress={''} />
          </ModalBody>
          <ModalFooter>
            {customerCtx?.email ? (
              <Button size={'sm'} onClick={handleLogout}>
                {'Logout'}
              </Button>
            ) : (
              <Button size={'sm'} onClick={handleRegisterClick}>
                {'Register'}
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
