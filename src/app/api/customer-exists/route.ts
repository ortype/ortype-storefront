import { authenticate } from '@commercelayer/js-auth'
import CommerceLayer from '@commercelayer/sdk'
import { NextRequest, NextResponse } from 'next/server'

type CustomerExistsRequest = {
  email: string
}

type CustomerExistsResponse = {
  success: boolean
  exists: boolean
  hasPassword: boolean
  error?: string
}

export async function POST(req: NextRequest) {
  console.log('🔍 [customer-exists] API route called')

  try {
    const body = (await req.json()) as CustomerExistsRequest
    const { email } = body

    console.log('🔍 [customer-exists] Checking email:', email)

    if (!email || typeof email !== 'string') {
      console.log('❌ [customer-exists] Invalid email provided')
      return NextResponse.json(
        {
          success: false,
          exists: false,
          hasPassword: false,
          error: 'Email is required',
        } as CustomerExistsResponse,
        { status: 400 }
      )
    }

    // Authenticate with integration credentials
    console.log('🔐 [customer-exists] Authenticating with integration credentials...')
    const token = await authenticate('client_credentials', {
      clientId: process.env.CL_SYNC_CLIENT_ID!,
      clientSecret: process.env.CL_SYNC_CLIENT_SECRET!,
      endpoint: process.env.CL_ENDPOINT!,
    })

    console.log('✅ [customer-exists] Got access token')

    const cl = CommerceLayer({
      organization: process.env.CL_SLUG!,
      accessToken: token.accessToken,
    })

    // Query customers by email
    // SDK uses flat filter syntax (different from REST API's filter[q][email_eq])
    console.log('📡 [customer-exists] Querying customers...')
    const customers = await cl.customers.list({
      filters: {
        email_eq: email,
      },
      fields: {
        customers: ['id', 'email', 'has_password'],
      },
    })

    console.log('📋 [customer-exists] Found customers:', customers.length)

    if (customers.length === 0) {
      console.log('ℹ️ [customer-exists] No customer found with this email')
      return NextResponse.json({
        success: true,
        exists: false,
        hasPassword: false,
      } as CustomerExistsResponse)
    }

    const customer = customers[0]
    console.log('👤 [customer-exists] Customer found:', {
      id: customer.id,
      email: customer.email,
      has_password: customer.has_password,
    })

    return NextResponse.json({
      success: true,
      exists: true,
      hasPassword: customer.has_password ?? false,
    } as CustomerExistsResponse)
  } catch (error) {
    console.error('❌ [customer-exists] Error:', error)
    return NextResponse.json(
      {
        success: false,
        exists: false,
        hasPassword: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      } as CustomerExistsResponse,
      { status: 500 }
    )
  }
}
