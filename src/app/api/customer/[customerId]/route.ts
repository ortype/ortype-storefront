import { authenticate } from '@commercelayer/js-auth'
import CommerceLayer from '@commercelayer/sdk'
import { NextRequest, NextResponse } from 'next/server'

interface CustomerLookupResponse {
  success: boolean
  customer?: {
    id: string
    email: string
    hasPassword: boolean
  }
  error?: string
}

export async function GET(
  request: NextRequest,
  { params }: { params: { customerId: string } }
): Promise<NextResponse<CustomerLookupResponse>> {
  const { customerId } = params

  if (!customerId) {
    return NextResponse.json(
      { success: false, error: 'Customer ID is required' },
      { status: 400 }
    )
  }

  try {
    // Use integration token server-side for customer lookup
    const token = await authenticate('client_credentials', {
      clientId: process.env.CL_SYNC_CLIENT_ID!,
      clientSecret: process.env.CL_SYNC_CLIENT_SECRET!,
      endpoint: process.env.CL_ENDPOINT,
    })

    const cl = CommerceLayer({
      organization: process.env.CL_SLUG,
      accessToken: token.accessToken,
    })

    const customer = await cl.customers.retrieve(customerId, {
      fields: {
        customers: ['email', 'has_password'],
      },
    })

    return NextResponse.json({
      success: true,
      customer: {
        id: customer.id!,
        email: customer.email!,
        hasPassword: customer.has_password ?? false,
      },
    })
  } catch (error) {
    console.error('Customer lookup error:', error)
    
    // Handle specific Commerce Layer errors
    if (error && typeof error === 'object' && 'status' in error) {
      const clError = error as { status: number; message?: string }
      if (clError.status === 404) {
        return NextResponse.json(
          { success: false, error: 'Customer not found' },
          { status: 404 }
        )
      }
    }

    return NextResponse.json(
      { success: false, error: 'Failed to lookup customer' },
      { status: 500 }
    )
  }
}

