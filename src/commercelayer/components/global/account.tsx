import {
  DrawerBackdrop,
  DrawerBody,
  DrawerCancel,
  DrawerCloseTrigger,
  DrawerConfirm,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerRoot,
  DrawerTitle,
} from '@/components/ui/drawer'
import {
  Button,
  ButtonGroup,
  Link as ChakraLink,
  Group,
  Text,
} from '@chakra-ui/react'
import Link from 'next/link'

import React, { useEffect, useState } from 'react'

import { LoginForm } from '@/commercelayer/components/forms/LoginForm'
import { SignUpForm } from '@/commercelayer/components/forms/SignUpForm'
import { useIdentityContext } from '@/commercelayer/providers/identity'

export const Account = ({ openLogin, setLoginOpen }) => {
  const { settings, config, customer, handleLogout } = useIdentityContext()

  const { resetPasswordUrl } = config

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
      <DrawerRoot
        lazyMount
        open={registerOpen}
        onOpenChange={(e) => setRegisterOpen(e.open)}
        // initialFocusEl={() => ref.current}
      >
        <DrawerBackdrop />
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{`Register`}</DrawerTitle>
            <DrawerCloseTrigger />
          </DrawerHeader>
          <DrawerBody>
            <SignUpForm
              emailAddress={customer.email}
              onSuccess={() => setRegisterOpen(false)}
              variant={'white'}
            />
          </DrawerBody>
          <DrawerFooter asChild>
            <Group gap={2} justifyContent={'center'}>
              <Text textStyle={'xs'} textAlign='center'>
                Already have an account?{' '}
              </Text>
              <Button
                variant={'solid'}
                bg={'black'}
                color={'white'}
                borderRadius={'5rem'}
                border={'2px solid #000'}
                size={'xs'}
                fontSize={'sm'}
                gap={1}
                _hover={{
                  bg: 'transparent',
                  color: 'colorPalette.fg',
                }}
                onClick={handleLoginClick}
              >
                {'Login'}
              </Button>
            </Group>
          </DrawerFooter>
        </DrawerContent>
      </DrawerRoot>
      <DrawerRoot
        lazyMount
        open={openLogin}
        onOpenChange={(e) => setLoginOpen(e.open)}
      >
        <DrawerBackdrop />
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>
              {settings?.customerId ? `Account` : 'Login'}
            </DrawerTitle>
            <DrawerCloseTrigger />
          </DrawerHeader>
          <DrawerBody>
            <LoginForm
              variant={'white'}
              emailAddress={customer.email}
              onSuccess={() => setLoginOpen(false)}
            />
          </DrawerBody>
          <DrawerFooter asChild>
            <Group gap={2} justifyContent={'center'}>
              {settings?.customerId && (
                <Button
                  as={Link}
                  href={`/account`}
                  variant={'outline'}
                  borderRadius={'full'}
                  size={'2xs'}
                  bg={'black'}
                  color={'white'}
                  _hover={{ bg: 'white', color: 'black' }}
                >
                  {'My account'}
                </Button>
              )}
              {customer?.email ? (
                <ButtonGroup gap={1} variant={'subtle'} hu>
                  <Button
                    borderRadius={'full'}
                    size={'2xs'}
                    bg={'black'}
                    color={'white'}
                    _hover={{ bg: 'white', color: 'black' }}
                    onClick={handleLogout}
                  >
                    {'Logout'}
                  </Button>
                </ButtonGroup>
              ) : (
                <ButtonGroup gap={1} variant={'subtle'}>
                  {resetPasswordUrl.length > 0 && (
                    <DrawerCancel asChild>
                      <ChakraLink
                        target='_blank'
                        as={Link}
                        href={`${resetPasswordUrl}`}
                      >
                        Forgot password?
                      </ChakraLink>
                    </DrawerCancel>
                  )}
                  <DrawerConfirm onClick={handleRegisterClick}>
                    {'Register'}
                  </DrawerConfirm>
                </ButtonGroup>
              )}
            </Group>
          </DrawerFooter>
        </DrawerContent>
      </DrawerRoot>
    </>
  )
}
