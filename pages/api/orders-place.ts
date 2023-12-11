// Write a Next.js API route in Typescript to handle a Commerce Layer webhook JSON payload for the orders.place event

// Here's an example of a Next.js API route in Typescript that handles a Commerce Layer webhook JSON payload for the `orders.place` event:
// This code defines a Next.js API route that expects a POST request with a JSON payload in the format of a Commerce Layer webhook for the `orders.place` event. It checks that the event is correct, extracts the order ID and status from the payload, and then does something with that information (e.g. updates a database). Finally, it responds with a 200 OK status code.

import CommerceLayer, { Attachments, LineItems } from '@commercelayer/sdk'
import { NextApiRequest, NextApiResponse } from 'next'
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
      line_items: LineItems
      // attachments: Attachments
    }
  }
  included: []
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.status(405).end() // Method Not Allowed
    return
  }

  // @TODO: check webhook secret
  // https://docs.commercelayer.io/core/callbacks-security
  // process.env.CL_ORDERS_PLACE_SECRET
  // e.g. Sanity check
  // Check if the "x-secret" header is present in the request
  // Check if the secret matches the expected value
  /*
  if (
    !req.headers['x-secret'] ||
    req.headers['x-secret'] !== process.env.SANITY_WEBHOOK_SECRET
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
  } = req.body as CommerceLayerWebhookPayload

  // const webhookPayload: CommerceLayerWebhookPayload = req.body
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
  } catch (error) {
    console.error(`Error sending email to ${customerEmail}: ${error}`)
  }

  res.status(200).end() // OK
}
