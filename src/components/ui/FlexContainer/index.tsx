import { Flex } from '@chakra-ui/react'

interface Props {
  className?: string
  children?: JSX.Element[] | JSX.Element | null
}

export const FlexContainer: React.FC<Props> = ({ children, className }) => (
  <Flex justifyContent={'start'} className={className}>
    {children}
  </Flex>
)
