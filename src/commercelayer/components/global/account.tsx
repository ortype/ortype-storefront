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
  Button,
  ButtonGroup,
  Link as ChakraLink,
  Group,
  Heading,
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
      <DialogRoot open={registerOpen} size={'xl'}>
        <DialogContent maxW={'35rem'} blurred={true}>
          <DialogHeader asChild>
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
          </DialogHeader>
          <DialogCloseTrigger onClick={() => setRegisterOpen(false)} />
          <DialogBody pb={2}>
            <SignUpForm
              emailAddress={customer.email}
              onSuccess={() => setRegisterOpen(false)}
            />
          </DialogBody>
          <DialogFooter asChild>
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
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
      <DialogRoot open={openLogin} size={'xl'}>
        <DialogContent maxW={'35rem'} blurred={true}>
          <DialogHeader asChild>
            <Heading
              textAlign={'center'}
              fontSize={'2.5rem'}
              lineHeight={1}
              fontWeight={'normal'}
              textTransform={'uppercase'}
              mx={'auto'}
              pb={6}
            >
              {settings?.customerId ? `Account` : 'Login'}
            </Heading>
          </DialogHeader>
          <DialogCloseTrigger onClick={() => setLoginOpen(false)} />
          <DialogBody pb={2}>
            <LoginForm
              emailAddress={customer.email}
              onSuccess={() => setLoginOpen(false)}
            />
          </DialogBody>
          <DialogFooter justifyContent={'center'}>
            <Group gap={2}>
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
                <ButtonGroup gap={1} variant={'subtle'}>
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
                    <Button
                      asChild
                      variant='text'
                      size='xs'
                      fontSize='xs'
                      px={2}
                      py={1}
                      h='auto'
                      minH='auto'
                    >
                      <ChakraLink
                        target='_blank'
                        as={Link}
                        href={`${resetPasswordUrl}`}
                      >
                        Forgot password?
                      </ChakraLink>
                    </Button>
                  )}
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
                    onClick={handleRegisterClick}
                  >
                    {'Register'}
                  </Button>
                </ButtonGroup>
              )}
            </Group>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </>
  )
}
