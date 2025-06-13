import CommerceLayer, { Order } from '@commercelayer/sdk'
import { LINE_ITEMS_SHOPPABLE } from '@/components/utils/constants'
import {
  CartSettings,
  InvalidCartSettings,
  UseCartSettingsOrInvalid,
} from 'CustomApp'
import React, { useContext, useEffect, useState } from 'react'

import type { TypeAccepted } from '@/commercelayer/providers/checkout/utils'

// default settings are by their nature not valid to show a full cart
// they will be used as fallback for errors or 404 page
export const defaultSettings: UseCartSettingsOrInvalid = {
  isValid: false,
}

export const isValidCart = (
  orderId: string | undefined,
  order: Order
): UseCartSettingsOrInvalid => {
  function invalidateCart(): InvalidCartSettings {
    return {
      validCart: false,
    } as InvalidCartSettings
  }

  if (!order || !orderId) {
    return invalidateCart()
  }

  const lineItemsShoppable = order.line_items?.filter((line_item) => {
    return LINE_ITEMS_SHOPPABLE.includes(line_item.item_type as TypeAccepted)
  })

  // If there are no shoppable items we redirect to the invalid page
  if ((lineItemsShoppable || []).length === 0) {
    console.log('Invalid: No shoppable line items')
    return invalidateCart()
  }

  if (order.status === 'placed') {
    console.log('Invalid: Order has been placed')
    return invalidateCart()
  }

  return {
    validCart: true,
  }
}
