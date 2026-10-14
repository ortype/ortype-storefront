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
  Drawer,
  Group,
  Heading,
  Portal,
  Text,
} from '@chakra-ui/react'
import Link from 'next/link'

import React, { useEffect, useState } from 'react'

import { LoginForm } from '@/commercelayer/components/forms/LoginForm'
import { SignUpForm } from '@/commercelayer/components/forms/SignUpForm'
import { useIdentityContext } from '@/commercelayer/providers/identity'
import { CloseButton } from '@/components/ui/close-button'

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
      <Drawer.Root
        lazyMount
        size={'md'}
        open={registerOpen}
        // initialFocusEl={() => ref.current}
      >
        <Portal>
          <Drawer.Backdrop css={{ backdropFilter: 'blur(5px)' }} />
          <Drawer.Positioner
          // p={10}
          >
            <Drawer.Content
              rounded={0}
              // rounded={40}
              p={4}
              bg={'#e7e7e7'}
            >
              <Drawer.CloseTrigger
                position={'absolute'}
                top={'1rem'}
                left={'-4rem'}
                asChild
              >
                <CloseButton size='2xl' />
              </Drawer.CloseTrigger>
              <Drawer.Header pt={2} pb={3}>
                <Drawer.Title
                  fontSize={'2rem'}
                  fontWeight={'normal'}
                  textTransform={'uppercase'}
                  lineHeight={1}
                  pb={3}
                  borderBottom={'1px solid #919191'}
                >
                  {`Register`}
                </Drawer.Title>
              </Drawer.Header>
              <Drawer.Body>
                <SignUpForm
                  emailAddress={customer.email}
                  onSuccess={() => setRegisterOpen(false)}
                  variant={'white'}
                />
              </Drawer.Body>
              <Drawer.Footer asChild>
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
              </Drawer.Footer>
            </Drawer.Content>
          </Drawer.Positioner>
        </Portal>
      </Drawer.Root>
      <Drawer.Root
        lazyMount
        size={'md'}
        open={openLogin}
        // initialFocusEl={() => ref.current}
      >
        <Portal>
          <Drawer.Backdrop css={{ backdropFilter: 'blur(5px)' }} />
          <Drawer.Positioner
          // p={10}
          >
            <Drawer.Content
              rounded={0}
              // rounded={40}
              p={4}
              bg={'#e7e7e7'}
            >
              <Drawer.CloseTrigger
                position={'absolute'}
                top={'1rem'}
                left={'-4rem'}
                asChild
              >
                <CloseButton size='2xl' />
              </Drawer.CloseTrigger>
              <Drawer.Header pt={2} pb={3}>
                <Drawer.Title
                  fontSize={'2rem'}
                  fontWeight={'normal'}
                  textTransform={'uppercase'}
                  lineHeight={1}
                  pb={3}
                  borderBottom={'1px solid #919191'}
                >
                  {settings?.customerId ? `Account` : 'Login'}
                </Drawer.Title>
              </Drawer.Header>
              <Drawer.Body>
                <LoginForm
                  variant={'white'}
                  emailAddress={customer.email}
                  onSuccess={() => setLoginOpen(false)}
                />
              </Drawer.Body>
              <Drawer.Footer asChild>
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
              </Drawer.Footer>
            </Drawer.Content>
          </Drawer.Positioner>
        </Portal>
      </Drawer.Root>
    </>
  )
}
