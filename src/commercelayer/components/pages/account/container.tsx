'use client'
import { LoginForm } from '@/commercelayer/components/forms/LoginForm'
import Navbar from '@/commercelayer/components/pages/account/navbar'
import CustomerProvider from '@/commercelayer/providers/customer'
import { useIdentityContext } from '@/commercelayer/providers/identity'
import {
  Box,
  Button,
  Card,
  Center,
  Container,
  Flex,
  GridItem,
  Heading,
  HStack,
  SimpleGrid,
  Spinner,
  Text,
} from '@chakra-ui/react'
import { CommerceLayer } from '@commercelayer/react-components'
import type { Settings } from 'CustomApp'
import { IconContext } from 'phosphor-react'
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
  const { isLoading, settings, clientConfig, config, customer } =
    useIdentityContext()

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
      <Container mt={6} maxW="60rem" position={'relative'}>
        <Heading
          textAlign={'center'}
          fontSize={'2rem'}
          fontWeight={'normal'}
          textTransform={'uppercase'}
          mx={'auto'}
          pb={8}
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
      <IconContext.Provider
        value={{
          size: 32,
          weight: 'fill',
          mirrored: false,
        }}
      >
        <CommerceLayer
          accessToken={clientConfig.accessToken || ''}
          endpoint={config.endpoint}
        >
          <CustomerProvider
            customerId={settings.customerId}
            config={clientConfig}
          >
            <Container mt={6} maxW="60rem" position={'relative'}>
              <Heading
                textAlign={'center'}
                fontSize={'2rem'}
                fontWeight={'normal'}
                textTransform={'uppercase'}
                mx={'auto'}
                pb={8}
              >
                {`your account or my account`}
              </Heading>
              <SimpleGrid columns={[1, null, 3]} gap={3}>
                <GridItem colSpan={1} p={2}>
                  <Box
                    px={3}
                    fontSize={'xs'}
                    textTransform={'uppercase'}
                    color={'#737373'}
                    mb={2}
                    asChild
                  >
                    <Flex gap={1} alignItems={'center'}>
                      {'Logged in as'}
                    </Flex>
                  </Box>
                  <HStack
                    justify="space-between"
                    w="full"
                    bg={'brand.50'}
                    py={2}
                    px={3}
                    h={8}
                  >
                    <Box>{email}</Box>
                    <Button
                      variant="text"
                      size="xs"
                      // onClick={logout}
                      fontSize="xs"
                      px={2}
                      py={1}
                      h="auto"
                      minH="auto"
                    >
                      {'Logout'}
                    </Button>
                  </HStack>

                  {/*<HStack
                    justify="space-between"
                    w="full"
                    bg={'brand.50'}
                    py={2}
                    px={3}
                    h={8}
                  >
                    <Text fontSize={'sm'} color={'brand.500'}>
                      {t('menu.loggedInAs')}
                    </Text>{' '}
                    <Box flexGrow={1} pl={4}>
                      <CustomerField
                        name="email"
                        attribute="email"
                        tagElement="span"
                      />
                    </Box>
                  </HStack>*/}
                  <Box
                    px={3}
                    fontSize={'xs'}
                    textTransform={'uppercase'}
                    color={'#737373'}
                    mt={4}
                    mb={2}
                    asChild
                  >
                    <Flex gap={1} alignItems={'center'}>
                      {'General'}
                    </Flex>
                  </Box>
                  <Navbar />
                </GridItem>
                <GridItem colSpan={2}>{children}</GridItem>
              </SimpleGrid>
            </Container>
          </CustomerProvider>
        </CommerceLayer>
      </IconContext.Provider>
    </>
  )
}

export default MyAccountContainer
