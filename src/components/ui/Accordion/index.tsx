import { Box } from '@chakra-ui/react'
import { AccordionContext } from '@/commercelayer/providers/accordion'
import { CheckoutContext } from '@/commercelayer/providers/checkout'
import { ReactNode, useContext } from 'react'

interface Props {
  index: number
  header: ReactNode
  children?: JSX.Element[] | JSX.Element
}

export const Accordion = ({
  children,
}: {
  children?: JSX.Element[] | JSX.Element | null
}) => {
  return <Box>{children}</Box>
}

export const AccordionItem = ({ children, index, header }: Props) => {
  const ctx = useContext(AccordionContext)
  const checkoutCtx = useContext(CheckoutContext)

  if (!ctx || !checkoutCtx) return null

  const handleSelection = () => {
    return ctx.isActive ? ctx.closeStep() : ctx.setStep()
  }

  return (
    <Box
      tabIndex={index}
      display={ctx.isActive ? 'block' : 'none'}
      // active: ctx.isActive,
      // disabled: ctx.status === 'disabled' || ctx.status === 'skip',
    >
      {header}
      {children}
    </Box>
  )
}
