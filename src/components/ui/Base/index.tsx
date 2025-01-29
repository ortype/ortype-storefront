import { Box } from '@chakra-ui/react'

export const Base = ({
  children,
}: {
  children?: JSX.Element[] | JSX.Element
}) => <Box>{children}</Box>
