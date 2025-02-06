import { Container, Flex } from '@chakra-ui/react'
import type { Settings } from 'CustomApp'

type Props = Pick<Settings, 'logoUrl' | 'companyName'>

function GuestHeader({ logoUrl, companyName }: Props): JSX.Element {
  return (
    <Container pos={'fixed'}>
      <Flex justifyContent={'space-between'} p={5}></Flex>
    </Container>
  )
}

export default GuestHeader
