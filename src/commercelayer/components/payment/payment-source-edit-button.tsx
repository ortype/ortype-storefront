import { Button } from '@chakra-ui/react'
import React, { type MouseEvent } from 'react'

interface PaymentSourceEditButtonProps {
  className?: string
  label: string
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void
}

export const PaymentSourceEditButton: React.FC<
  PaymentSourceEditButtonProps
> = ({ className, label, onClick }) => {
  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    if (onClick) {
      onClick(e)
    }
  }

  // @TODO: consider the `edit button` style from checkout summary
  return (
    <Button
      className={className}
      variant="text"
      size="xs"
      onClick={handleClick}
      fontSize="xs"
      px={2}
      py={1}
      h="auto"
      minH="auto"
    >
      {label}
    </Button>
  )
}

export default PaymentSourceEditButton
