import getCommerceLayer, {
  isValidCommerceLayerConfig,
  type CommerceLayerConfig,
} from '@/commercelayer/utils/getCommerceLayer'
import type { Order } from '@commercelayer/sdk'

type CreateOrderParams = {
  config: CommerceLayerConfig
  metadata?: Record<string, any>
  attributes?: Record<string, any>
}

type CreateOrderOutcome = {
  success: boolean
  order?: Order
  error?: {
    message: string
    originalError?: unknown
  }
}

/** Creates a CL order. Only handles the SDK interaction (no state, no storage). */
export async function createOrder(
  params: CreateOrderParams
): Promise<CreateOrderOutcome> {
  const { config, metadata, attributes = {} } = params
  const cl = isValidCommerceLayerConfig(config)
    ? getCommerceLayer(config)
    : undefined

  try {
    if (cl == null) {
      return {
        success: false,
        error: {
          message: 'Commerce Layer client is not initialized',
        },
      }
    }

    const order = await cl.orders.create({
      metadata,
      ...attributes,
    })
    return { success: true, order }
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('createOrder error:', error)
    }
    return {
      success: false,
      error: {
        message: 'Failed to create order',
        originalError: error,
      },
    }
  }
}
