import { authenticate } from '@commercelayer/js-auth'
import CommerceLayer from '@commercelayer/sdk'
import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

type PasswordResetRequest = {
  email: string
  locale: string
}

type PasswordResetResponse = {
  success: boolean
  error?: string
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as PasswordResetRequest
    const { email, locale = 'en' } = body

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Email is required' } as PasswordResetResponse,
        { status: 400 }
      )
    }

    // Authenticate with integration credentials (fresh token each request)
    const token = await authenticate('client_credentials', {
      clientId: process.env.CL_SYNC_CLIENT_ID!,
      clientSecret: process.env.CL_SYNC_CLIENT_SECRET!,
      endpoint: process.env.CL_ENDPOINT!,
    })

    const cl = CommerceLayer({
      organization: process.env.CL_SLUG!,
      accessToken: token.accessToken,
    })

    // Create customer_password_reset resource
    const passwordReset = await cl.customer_password_resets.create({
      customer_email: email,
    })

    const resetToken = passwordReset.reset_password_token
    const resetId = passwordReset.id

    if (!resetToken || !resetId) {
      console.error('[password-reset] Missing token or id from CL response')
      return NextResponse.json(
        {
          success: false,
          error: 'Unable to process password reset. Please try again.',
        } as PasswordResetResponse,
        { status: 500 }
      )
    }

    // Send email with reset link
    const baseUrl =
      process.env.NEXT_PUBIC_STOREFRONT_URL || 'http://localhost:8000'
    const resetLink = `${baseUrl}/${locale}/reset-password?id=${resetId}&token=${resetToken}`

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
      to: email,
      subject: 'Reset your password — Or Type',
      text: `You requested a password reset for your Or Type account.\n\nClick the link below to reset your password:\n${resetLink}\n\nIf you didn't request this, you can safely ignore this email.\n\nThis link will expire after a short time.`,
      html: `
        <p>You requested a password reset for your Or Type account.</p>
        <p><a href="${resetLink}">Click here to reset your password</a></p>
        <p>Or copy and paste this link into your browser:</p>
        <p>${resetLink}</p>
        <p>If you didn't request this, you can safely ignore this email.</p>
        <p><em>This link will expire after a short time.</em></p>
      `,
    }

    await transporter.sendMail(mailOptions)
    console.log(`[password-reset] Email sent to ${email}`)

    return NextResponse.json({ success: true } as PasswordResetResponse)
  } catch (error) {
    console.error('[password-reset] Error:', error)

    // Always return success to the client to avoid revealing whether the email exists
    return NextResponse.json({ success: true } as PasswordResetResponse)
  }
}
