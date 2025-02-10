import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Box,
  Button,
  Container,
  Group,
  Heading,
  Input,
  Link,
  SimpleGrid,
  Stack,
  Switch,
  useDisclosure,
} from '@chakra-ui/react'
import React, { useEffect, useState } from 'react'

import { LoginForm } from '@/commercelayer/components/forms/LoginForm'
import { SignUpForm } from '@/commercelayer/components/forms/SignUpForm'
import { useIdentityContext } from '@/commercelayer/providers/Identity'
import { getStoredTokenKey } from '@/commercelayer/utils/oauthStorage'

export const Account = () => {
  const { settings, config, customer, handleLogout } = useIdentityContext()

  const [loginOpen, setLoginOpen] = useState(false)
  const [registerOpen, setRegisterOpen] = useState(false)

  const handleRegisterClick = () => {
    setLoginOpen(false)
    setTimeout(() => {
      setRegisterOpen(true)
    }, 500)
  }

  const handleLoginClick = () => {
    setRegisterOpen(false)
    setTimeout(() => {
      setLoginOpen(true)
    }, 500)
  }

  return (
    <>
      <Button
        onClick={() => setLoginOpen(true)}
        size={'xs'}
        variant={'outline'}
        bg={'white'}
      >
        {settings.customerId ? `Account` : `Login`}
      </Button>
      <DialogRoot open={registerOpen} size={'md'}>
        {/*<DialogBackdrop />*/}
        <DialogContent bg={'white'}>
          <DialogHeader>Register</DialogHeader>
          <DialogCloseTrigger onClick={() => setRegisterOpen(false)} />
          <DialogBody>
            <SignUpForm />
          </DialogBody>
          <DialogFooter>
            <Button size={'sm'} onClick={handleLoginClick}>
              {'Login'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
      <DialogRoot open={loginOpen} size={'md'}>
        {/*<DialogBackdrop />*/}
        <DialogContent bg={'white'}>
          <DialogHeader>Login</DialogHeader>
          <DialogCloseTrigger onClick={() => setLoginOpen(false)} />
          <DialogBody>
            <LoginForm />
          </DialogBody>
          <DialogFooter>
            <Group gap={2}>
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
            </Group>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </>
  )
}
