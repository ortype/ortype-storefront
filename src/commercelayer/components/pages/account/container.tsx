'use client'
import { LoginForm } from '@/commercelayer/components/forms/LoginForm'
import Navbar from '@/commercelayer/components/pages/account/navbar'
import CustomerProvider from '@/commercelayer/providers/customer'
import { useIdentityContext } from '@/commercelayer/providers/identity'
import {
  Box,
  Button,
  Center,
  Container,
  Flex,
  Heading,
  HStack,
  Spinner,
  Text,
  VStack,
} from '@chakra-ui/react'
import type { Settings } from 'CustomApp'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
interface Props {
  settings: Settings
  children: React.ReactElement
}

function MyAccountContainer({
  // settings,
  children,
}: Props): JSX.Element {
  const { t } = useTranslation()
  const { isLoading, settings, handleLogout, clientConfig, config, customer } =
    useIdentityContext()

  const router = useRouter()
  /*
  useEffect(() => {
    console.log('customer.userMode: ', customer.userMode)
    if (!isLoading && !customer.userMode) {
      router.push('/login')
    }
  }, [isLoading])
  */

  const logoutHandler = () => {
    handleLogout()
    router.push('/')
  }

  const email = customer?.email as string
  if (isLoading || !settings)
    return (
      <Box pos="fixed" inset="0" bg="bg/80">
        <Center h="full">
          <Spinner color="black" size={'xl'} />
        </Center>
      </Box>
    )

  if (!customer.userMode) {
    return (
      <Container
        my={6}
        maxW={'35rem'}
        minH={'40rem'}
        justifyContent={'center'}
        centerContent
        position={'relative'}
      >
        <Heading
          textAlign={'center'}
          fontSize={'2.5rem'}
          lineHeight={1}
          fontWeight={'normal'}
          textTransform={'uppercase'}
          mx={'auto'}
          pb={6}
        >
          {`your account or my account`}
        </Heading>
        <Flex justify={'center'}>
          <LoginForm />
        </Flex>
      </Container>
    )
  }

  return (
    <>
      <CustomerProvider customerId={settings.customerId} config={clientConfig}>
        <Container my={6} maxW="50rem" centerContent position={'relative'}>
          <Heading
            textAlign={'center'}
            fontSize={'2.5rem'}
            fontWeight={'normal'}
            textTransform={'uppercase'}
            mx={'auto'}
            pb={6}
          >
            {`your account or my account`}
          </Heading>
          <VStack gap={4} w={'full'}>
            <Navbar />
            {children}
            <HStack
              mt={4}
              justify="space-between"
              w="full"
              bg={'brand.50'}
              py={2}
              px={3}
              h={8}
            >
              <Text minW={'8rem'} fontSize={'sm'} color={'brand.500'}>
                {'Logged in as'}
              </Text>
              <Box flexGrow={1} pl={4}>
                {email}
              </Box>
              <Button
                variant="text"
                size="xs"
                onClick={logoutHandler}
                fontSize="xs"
                px={2}
                py={1}
                h="auto"
                minH="auto"
              >
                {'Logout'}
              </Button>
            </HStack>
          </VStack>
        </Container>
      </CustomerProvider>
    </>
  )
}

export default MyAccountContainer
