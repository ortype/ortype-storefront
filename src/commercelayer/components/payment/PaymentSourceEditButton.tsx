import React, { type MouseEvent } from 'react'

interface PaymentSourceEditButtonProps {
  className?: string
  label: string
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void
}

export const PaymentSourceEditButton: React.FC<PaymentSourceEditButtonProps> = ({
  className,
  label,
  onClick,
}) => {
  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    if (onClick) {
      onClick(e)
    }
  }

  return (
    <button
      type="button"
      className={className}
      onClick={handleClick}
    >
      {label}
    </button>
  )
}

export default PaymentSourceEditButton
