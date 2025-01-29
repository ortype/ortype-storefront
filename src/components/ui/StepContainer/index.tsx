import { Container } from '@chakra-ui/react'

interface Props {
  className: string
  children?: JSX.Element[] | JSX.Element | null
}

export const StepContainer: React.FC<Props> = ({ children, className }) => (
  <Container className={className}>{children}</Container>
)
