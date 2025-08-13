import React, { useContext, type ReactNode } from 'react'
import { CheckoutContext } from '@/commercelayer/providers/checkout'

interface ErrorMessage {
  code: string
  resource: string
  field: string
  message: string
}

interface ErrorsProps {
  resource?: string
  messages?: ErrorMessage[]
  children?: (props: { errors?: string[] }) => ReactNode
}

export const Errors: React.FC<ErrorsProps> = ({
  resource = 'orders',
  messages = [],
  children,
}) => {
  const checkoutCtx = useContext(CheckoutContext)

  if (!checkoutCtx) {
    return null
  }

  const { order } = checkoutCtx

  // Extract errors from the order or other sources
  const errors = getErrorsFromOrder(order, resource, messages)

  if (children && typeof children === 'function') {
    return <>{children({ errors })}</>
  }

  // Default error rendering
  if (!errors || errors.length === 0) {
    return null
  }

  return (
    <div className="errors">
      {errors.map((error, index) => (
        <div key={index} className="error">
          {error}
        </div>
      ))}
    </div>
  )
}

// Helper function to extract errors from order
function getErrorsFromOrder(
  order: any,
  resource: string,
  messageTemplates: ErrorMessage[]
): string[] {
  if (!order?.errors) {
    return []
  }

  const errors: string[] = []

  // Process Commerce Layer API errors
  if (Array.isArray(order.errors)) {
    for (const error of order.errors) {
      // Find matching message template
      const template = messageTemplates.find(
        (msg) =>
          msg.code === error.code &&
          msg.resource === error.source?.pointer?.split('/')[1] &&
          msg.field === error.source?.pointer?.split('/')[2]
      )

      if (template) {
        errors.push(template.message)
      } else {
        // Fallback to error detail or title
        errors.push(error.detail || error.title || 'An error occurred')
      }
    }
  }

  // Remove empty or whitespace-only errors
  return errors.filter((error) => error && error.trim().length > 0)
}

export default Errors
