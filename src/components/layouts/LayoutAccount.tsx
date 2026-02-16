import type { Settings } from 'CustomApp'

import { useIdentityContext } from '@/commercelayer/providers/identity'
import { Box, Card, Container, Flex } from '@chakra-ui/react'
import { useState } from 'react'

type LayoutAccountProps = Pick<Settings, 'isGuest'> & {
  aside: React.ReactNode | null
  main: React.ReactNode
}

export function LayoutAccount({
  main,
  aside,
  isGuest,
}: LayoutAccountProps): JSX.Element {
  const { customer } = useIdentityContext()
  const [noScrollClassname, setNoScrollClassName] = useState('')

  return (
    <Box className={noScrollClassname}>
      <Container>
        {!customer.userMode ? (
          <Flex className="flex flex-wrap justify-end items-stretch flex-col max-w-screen-md mx-auto min-h-screen md:flex-row">
            <Box
              id="main"
              className="flex-none justify-center order-first h-screen md:(flex-1 order-last h-auto)"
            >
              <Card.Root size="sm">
                <Card.Body color="fg.muted">{main}</Card.Body>
              </Card.Root>
            </Box>
          </Flex>
        ) : (
          <Flex
            direction="column"
            className="flex flex-wrap justify-end items-stretch flex-col min-h-screen md:flex-row"
          >
            <Box>{aside}</Box>
            <Box
              id="main"
              className="flex-none justify-center order-first h-screen md:(flex-1 order-last h-auto)"
            >
              <Card.Root size="sm">
                <Card.Body color="fg.muted">{main}</Card.Body>
              </Card.Root>
            </Box>
          </Flex>
        )}
      </Container>
    </Box>
  )
}
