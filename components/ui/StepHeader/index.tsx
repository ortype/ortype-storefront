// import { Badge } from "../Badge"
import { Box, Heading, Text } from '@chakra-ui/react'

interface Props {
  status: 'edit' | 'done' | 'disabled' | 'skip'
  label: string
  info: string | Element | JSX.Element
  stepNumber?: number
  onEditRequest?: () => void
}

export const StepHeader: React.FC<Props> = ({
  status,
  label,
  info,
  stepNumber,
}) => {
  return (
    <Box
    // status === "disabled"
    >
      {/*<Badge status={status} stepNumber={stepNumber} />*/}
      <Heading
        as={'h3'}
        fontSize={55}
        textTransform={'uppercase'}
        fontWeight={'normal'}
        textAlign={'center'}
      >
        {label}
      </Heading>
      {/*<Text>{info as any}</Text>*/}
    </Box>
  )
}

interface WrapperProps {
  disabled?: boolean
}
