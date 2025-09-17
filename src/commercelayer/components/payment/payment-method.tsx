import { Radio, RadioGroup } from '@/components/ui/radio'
import { HStack, Text } from '@chakra-ui/react'
import { PaymentMethod as PaymentMethodType } from '@commercelayer/sdk'
import classNames from 'classnames'
import React, { useContext, useEffect, useState, type ReactNode } from 'react'

import { CheckoutContext } from '@/commercelayer/providers/checkout'

export interface PaymentMethodOnClickParams {
  payment?: PaymentMethodType | Record<string, any>
  paymentSource?: Record<string, any>
}

interface PaymentMethodProps {
  children: ReactNode
  className?: string
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
  loader = 'Loading...',
  autoSelectSinglePaymentMethod,
  clickableContainer,
  hide = [],
  onClick,
  sortBy,
  ...props
}) => {
  const [paymentSelected, setPaymentSelected] = useState('')
  // Preserve payment methods during loading to prevent disappear/reappear
  const [cachedPaymentMethods, setCachedPaymentMethods] = useState<PaymentMethodType[]>([])

  const checkoutCtx = useContext(CheckoutContext)

  if (!checkoutCtx) {
    return null
  }

  const { order, isLoading, loadPaymentMethods } = checkoutCtx

  // Get payment methods from order
  const paymentMethods = order?.available_payment_methods || []

  // Cache payment methods when they become available, preserve during loading
  useEffect(() => {
    if (paymentMethods.length > 0) {
      setCachedPaymentMethods(paymentMethods)
    }
  }, [paymentMethods])

  // Use cached payment methods during loading to prevent disappear/reappear
  const effectivePaymentMethods = paymentMethods.length > 0 ? paymentMethods : (isLoading ? cachedPaymentMethods : [])

  // Load payment methods if not available
  useEffect(() => {
    if (!effectivePaymentMethods.length && !isLoading && loadPaymentMethods) {
      loadPaymentMethods().catch(console.error)
    }
  }, [effectivePaymentMethods.length, isLoading, loadPaymentMethods])

  // Filter out hidden payment methods
  const filteredPaymentMethods = effectivePaymentMethods.filter((pm) => {
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

  // Use CheckoutContext loading state instead of local loading state
  const loading = isLoading || sortedPaymentMethods.length === 0

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

  return (
    <PaymentMethodLoadingContext.Provider value={loading}>
      <div onClick={handleContainerClick} {...props}>
        {/* Always render children to prevent disappear/reappear */}
        {sortedPaymentMethods.length > 0 ? (
          sortedPaymentMethods.map((paymentMethod) => (
            <PaymentMethodProvider key={paymentMethod.id} value={paymentMethod}>
              {children}
            </PaymentMethodProvider>
          ))
        ) : (
          // Render children with null context when loading - let components handle loading state
          <PaymentMethodProvider key="loading" value={null as any}>
            {children}
          </PaymentMethodProvider>
        )}
      </div>
    </PaymentMethodLoadingContext.Provider>
  )
}

// Context provider for payment method data
const PaymentMethodContext = React.createContext<PaymentMethodType | null>(null)

// Context for PaymentMethod loading state
const PaymentMethodLoadingContext = React.createContext<boolean>(false)

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

export const usePaymentMethodLoading = () => {
  const loading = useContext(PaymentMethodLoadingContext)
  return loading
}
