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
    useDisclosure
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
      <Button onClick={onLoginOpen}>
        {customerCtx.customerId ? `Account` : `Login`}
      </Button>
      <Modal isOpen={isRegisterOpen} onClose={onRegisterClose} size={'lg'}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Register</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <RegisterForm />
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
              {customerCtx?.customerId && (
                <Button
                  as={Link}
                  href={`/account`}
                  // href={`http://localhost:3001/orders?accessToken=${customerCtx?.accessToken}`}
                  // isExternal
                >
                  {'My account'}
                </Button>
              )}
              {customerCtx?.email ? (
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
