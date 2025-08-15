import { LINE_ITEMS_SHOPPABLE } from '@/components/utils/constants'
import CommerceLayer, { Order } from '@commercelayer/sdk'
import {
  InvalidCheckoutSettings,
  UseCheckoutSettingsOrInvalid,
} from 'CustomApp'
import React, { useContext, useEffect, useState } from 'react'

import getCommerceLayer, { isValidCommerceLayerConfig } from '@/commercelayer/utils/getCommerceLayer'
import type { TypeAccepted } from '@/commercelayer/providers/checkout/utils'

export const defaultSettings: UseCheckoutSettingsOrInvalid = {
  isValid: false,
}

export const isValidCheckout = async (
  orderId: string | undefined,
  order: Order,
  isLoading: boolean,
  paymentReturn: string,
  redirectResult: string,
  config
): UseCheckoutSettingsOrInvalid => {
  function invalidateCheckout(): InvalidCheckoutSettings {
    return {
      validCheckout: false,
    } as InvalidCheckoutSettings
  }

  if (!order || !orderId) {
    console.log('Invalid checkout: missing params', {
      order,
      orderId,
      isLoading,
    })
    return invalidateCheckout()
  }

  const isPaymentReturn = paymentReturn === 'true' || !!redirectResult

  const lineItemsShoppable = order.line_items?.filter((line_item) => {
    return LINE_ITEMS_SHOPPABLE.includes(line_item.item_type as TypeAccepted)
  })

  // If there are no shoppable items we redirect to the invalid page
  if ((lineItemsShoppable || []).length === 0) {
    console.log('Invalid checkout: No shoppable line items')
    return invalidateCheckout()
  }

  if (order.status === 'draft' || order.status === 'pending') {
    // If returning from payment (PayPal) skip order refresh and payment_method reset
    console.log(
      !paymentReturn ? 'refresh order' : 'return from external payment'
    )
    if (!paymentReturn) {
      const _refresh = !paymentReturn
      try {
        const cl = isValidCommerceLayerConfig(config) ? getCommerceLayer(config) : undefined
        if (!orderId || cl == null) {
          console.log('Invalid checkout: missing SDK not initalized')
          return invalidateCheckout()
        }
        await cl.orders.update({
          id: orderId,
          _refresh,
          payment_method: cl.payment_methods.relationship(null),
          ...(!order.autorefresh && { autorefresh: true }),
        })
      } catch {
        console.log('error refreshing order')
      }
    }
  } else if (order.status !== 'placed' && order.status !== 'pending') {
    console.log('Invalid checkout: order is not draft, pending, or placed')
    return invalidateCheckout()
  }

  return {
    validCheckout: true,
  }
}
