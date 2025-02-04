import { Container, Flex } from '@chakra-ui/react'

interface Props {
  className: string
  children?: JSX.Element[] | JSX.Element | null
}

export const StepContainer: React.FC<Props> = ({ children, className }) => (
  <Container className={className} py={10} centerContent>
    {children}
  </Container>
)
