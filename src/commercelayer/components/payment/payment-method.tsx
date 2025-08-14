import { PaymentMethod as PaymentMethodType } from '@commercelayer/sdk'
import classNames from 'classnames'
import React, { useContext, useEffect, useState, type ReactNode } from 'react'
import { RadioGroup, Radio } from '@/components/ui/radio'
import { HStack, Text } from '@chakra-ui/react'

import { CheckoutContext } from '@/commercelayer/providers/checkout'

export interface PaymentMethodOnClickParams {
  payment?: PaymentMethodType | Record<string, any>
  paymentSource?: Record<string, any>
}

interface PaymentMethodProps {
  children: ReactNode
  className?: string
  activeClass?: string
  loader?: ReactNode
  autoSelectSinglePaymentMethod?: boolean | (() => void)
  clickableContainer?: boolean
  hide?: string[]
  onClick?: (params: PaymentMethodOnClickParams) => void
  sortBy?: Array<PaymentMethodType['payment_source_type']>
}

export const PaymentMethod: React.FC<PaymentMethodProps> = ({
  children,
  className,
  activeClass,
  loader = 'Loading...',
  autoSelectSinglePaymentMethod,
  clickableContainer,
  hide = [],
  onClick,
  sortBy,
  ...props
}) => {
  const [loading, setLoading] = useState(true)
  const [paymentSelected, setPaymentSelected] = useState('')

  const checkoutCtx = useContext(CheckoutContext)

  if (!checkoutCtx) {
    return null
  }

  const { order, isLoading, loadPaymentMethods } = checkoutCtx

  // Get payment methods from order
  const paymentMethods = order?.available_payment_methods || []

  // Load payment methods if not available
  useEffect(() => {
    if (!paymentMethods.length && !isLoading && loadPaymentMethods) {
      loadPaymentMethods().catch(console.error)
    }
  }, [paymentMethods.length, isLoading, loadPaymentMethods])

  // Filter out hidden payment methods
  const filteredPaymentMethods = paymentMethods.filter((pm) => {
    if (typeof hide === 'function') {
      return !hide(pm)
    }
    return !hide.includes(pm.payment_source_type)
  })

  // Sort payment methods if sortBy is provided
  const sortedPaymentMethods = sortBy
    ? [...filteredPaymentMethods].sort((a, b) => {
        const aIndex = sortBy.indexOf(a.payment_source_type)
        const bIndex = sortBy.indexOf(b.payment_source_type)
        if (aIndex === -1) return 1
        if (bIndex === -1) return -1
        return aIndex - bIndex
      })
    : filteredPaymentMethods

  useEffect(() => {
    if (sortedPaymentMethods.length > 0) {
      // Auto-select single payment method
      if (
        autoSelectSinglePaymentMethod &&
        sortedPaymentMethods.length === 1 &&
        !paymentSelected
      ) {
        const [paymentMethod] = sortedPaymentMethods
        setPaymentSelected(paymentMethod.id)

        if (onClick) {
          onClick({
            payment: paymentMethod,
            paymentSource: order?.payment_source,
          })
        }

        if (typeof autoSelectSinglePaymentMethod === 'function') {
          autoSelectSinglePaymentMethod()
        }
      }

      setTimeout(() => {
        setLoading(false)
      }, 200)
    }
  }, [
    sortedPaymentMethods,
    order,
    autoSelectSinglePaymentMethod,
    onClick,
    paymentSelected,
  ])

  const handlePaymentMethodClick = (paymentMethod: PaymentMethodType) => {
    if (clickableContainer && onClick) {
      setPaymentSelected(paymentMethod.id)
      onClick({
        payment: paymentMethod,
        paymentSource: order?.payment_source,
      })
    }
  }

  // For clickable container, handle the click at this level
  const handleContainerClick = () => {
    if (clickableContainer && sortedPaymentMethods.length > 0) {
      const [firstPaymentMethod] = sortedPaymentMethods
      handlePaymentMethodClick(firstPaymentMethod)
    }
  }

  if (loading || isLoading) {
    return <div>{loader}</div>
  }

  return (
    <div
      className={classNames(className, {
        [activeClass || 'active']: paymentSelected,
      })}
      onClick={handleContainerClick}
      {...props}
    >
      {sortedPaymentMethods.map((paymentMethod) => (
        <PaymentMethodProvider key={paymentMethod.id} value={paymentMethod}>
          {children}
        </PaymentMethodProvider>
      ))}
    </div>
  )
}

// Context provider for payment method data
const PaymentMethodContext = React.createContext<PaymentMethodType | null>(null)

interface PaymentMethodProviderProps {
  value: PaymentMethodType
  children: ReactNode
}

export const PaymentMethodProvider: React.FC<PaymentMethodProviderProps> = ({
  value,
  children,
}) => {
  return (
    <PaymentMethodContext.Provider value={value}>
      {children}
    </PaymentMethodContext.Provider>
  )
}

export const usePaymentMethodContext = () => {
  const context = useContext(PaymentMethodContext)
  return context // Allow null context - components can handle this case
}

export const usePaymentMethodContextRequired = () => {
  const context = useContext(PaymentMethodContext)
  if (!context) {
    throw new Error(
      'usePaymentMethodContextRequired must be used within PaymentMethodProvider'
    )
  }
  return context
}
