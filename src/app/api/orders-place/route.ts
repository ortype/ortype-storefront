// Orders place webhook is managed at:
// `${process.env.CL_SLUG}.commercelayer.app/webhooks/${webhookId}
// e.g. https://owenhoskins.ngrok.app/api/orders-place

import CommerceLayer, { LineItem } from '@commercelayer/sdk'
import { NextRequest, NextResponse } from 'next/server'

import nodemailer from 'nodemailer'

type CommerceLayerWebhookPayload = {
  event: string
  data: {
    id: string
    type: string
    attributes: {
      status: string
      customer_email: string
      // add any other attributes you need here
    }
    relationships: {
      line_items: LineItem[]
    }
  }
  included: []
}

export async function POST(
  request: Request,
  response: NextResponse<CommerceLayerWebhookPayload>
) {
  /*
  // with new route handlers this is not required (?)
  if (request.method !== 'POST') {
    res.status(405).end() // Method Not Allowed
    return
  }
  */

  // @TODO: check webhook secret
  // https://docs.commercelayer.io/core/callbacks-security
  // process.env.CL_ORDERS_PLACE_SECRET
  // e.g. Sanity check
  // Check if the "x-secret" header is present in the request
  // Check if the secret matches the expected value
  /*
  if (
    !request.headers['x-secret'] ||
    request.headers['x-secret'] !== process.env.SANITY_WEBHOOK_SECRET
  ) {
    return res.status(401).json({ error: 'Unauthorized' })
  }  
  */

  const {
    data: {
      id: orderId,
      attributes: { status: orderStatus, customer_email: customerEmail },
      // relationships: { line_items },
    },
    included,
  } = (await request.json()) as CommerceLayerWebhookPayload

  // const webhookPayload: CommerceLayerWebhookPayload = request.body
  console.log(
    'webhookPayload: ',
    orderId,
    orderStatus,
    customerEmail,
    included
    // line_items,
    // line_items[0],
    // line_items[0]?.metadata
  )

  const includedLineItems = included?.filter(
    (item) => item.type === 'line_items' && item.sku_code !== null
  )
  // @TODO: this currently only finds the first
  console.log('includedLineItems: ', includedLineItems)

  // @TODO: iterate through line items for license and font file delivery

  // send an email to the customer
  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_SMTP,
    port: process.env.MAIL_PORT,
    secure: false,
    auth: {
      user: process.env.MAIL_URL_USER,
      pass: process.env.MAIL_URL_PASS,
    },
  })

  const mailOptions = {
    from: process.env.MAIL_URL_USER,
    to: customerEmail,
    subject: `Your order ${orderId} has been ${orderStatus}`,
    text: `Dear customer, your order ${orderId} has been ${orderStatus}. Thank you for shopping with us!`,
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log(`Email sent to ${customerEmail}`)
    return NextResponse.json({
      status: 200,
      revalidated: true, // what does this option do?
      now: Date.now(),
    })
  } catch (error) {
    console.error(`Error sending email to ${customerEmail}: ${error}`)
    return new Response(error.message, { status: 500 })
  }
}
