import { Box, Container, Flex, Text } from '@chakra-ui/react'

export function ErrorContainer({
  children,
}: {
  children: React.ReactNode
}): JSX.Element {
  return (
    <Box>
      <Container>
        <Flex>
          <Flex justify={'center'} alignItems={'center'} justifySelf={'center'}>
            <Text>{children}</Text>
          </Flex>
        </Flex>
      </Container>
    </Box>
  )
}
