import { Container, Stack } from '@chakra-ui/react'

interface Props {
  aside: JSX.Element[] | JSX.Element | null
  main: JSX.Element[] | JSX.Element | null
}

export const LayoutDefault: React.FC<Props> = ({ main, aside }) => {
  return (
    <Container>
      <Stack direction={'column'}>{main}</Stack>
      <Stack direction={'column'}>{aside}</Stack>
    </Container>
  )
}
