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
import { useIdentityContext } from '@/commercelayer/providers/identity'
import { getStoredTokenKey } from '@/commercelayer/utils/oauthStorage'

export const Account = ({ openLogin, setLoginOpen }) => {
  const { settings, config, customer, handleLogout } = useIdentityContext()

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
      <DialogRoot open={registerOpen} size={'md'}>
        {/*<DialogBackdrop />*/}
        <DialogContent bg={'white'}>
          <DialogHeader>Register</DialogHeader>
          <DialogCloseTrigger onClick={() => setRegisterOpen(false)} />
          <DialogBody>
            <SignUpForm emailAddress={customer.email} />
          </DialogBody>
          <DialogFooter>
            <Button size={'sm'} onClick={handleLoginClick}>
              {'Login'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
      <DialogRoot open={openLogin} size={'md'}>
        {/*<DialogBackdrop />*/}
        <DialogContent bg={'white'}>
          <DialogHeader>Login</DialogHeader>
          <DialogCloseTrigger onClick={() => setLoginOpen(false)} />
          <DialogBody>
            <LoginForm
              emailAddress={customer.email}
              onSuccess={() => setLoginOpen(false)}
            />
          </DialogBody>
          <DialogFooter>
            <Group gap={2}>
              {settings?.customerId && (
                <Button
                  as={Link}
                  href={`/account`}
                  variant={'text'}
                  size={'sm'}
                  fontSize={'md'}
                  // href={`http://localhost:3001/orders?accessToken=${customerCtx?.accessToken}`}
                  // isExternal
                >
                  {'My account'}
                </Button>
              )}
              {customer?.email ? (
                <Button
                  variant={'outline'}
                  bg={'white'}
                  borderRadius={'5rem'}
                  size={'sm'}
                  fontSize={'md'}
                  onClick={handleLogout}
                >
                  {'Logout'}
                </Button>
              ) : (
                <Button
                  variant={'outline'}
                  bg={'white'}
                  borderRadius={'5rem'}
                  size={'sm'}
                  fontSize={'md'}
                  onClick={handleRegisterClick}
                >
                  {'Register'}
                </Button>
              )}
            </Group>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </>
  )
}
