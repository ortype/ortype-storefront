import { i18nRouter } from 'next-i18n-router'
import { NextRequest, NextResponse } from 'next/server'
import i18nConfig from '../i18nConfig'

function checkStagingAuth(request: NextRequest): NextResponse | null {
  // Only enforce the staging gate in production deployments, never on
  // localhost, even if staging credentials happen to be set locally.
  if (process.env.NODE_ENV !== 'production') {
    return null
  }

  const authHeader = request.headers.get('authorization')
  const stagingUsername = process.env.STAGING_USERNAME
  const stagingPassword = process.env.STAGING_PASSWORD

  // If credentials aren't configured, skip the gate
  if (!stagingUsername || !stagingPassword) {
    return null
  }

  if (authHeader?.startsWith('Basic ')) {
    const encoded = authHeader.slice(6)
    const decoded = Buffer.from(encoded, 'base64').toString('utf-8')
    const [username, password] = decoded.split(':')

    if (username === stagingUsername && password === stagingPassword) {
      return null // Auth passed, continue
    }
  }

  // Auth failed or missing, return 401 with WWW-Authenticate header
  return new NextResponse('Unauthorized', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Staging"',
    },
  })
}

export async function proxy(request: NextRequest) {
  // Check staging auth first
  const authResponse = checkStagingAuth(request)
  if (authResponse) {
    return authResponse
  }

  // If auth passed, continue with i18n routing
  return i18nRouter(request, i18nConfig)
}

// applies this middleware only to files in the app directory
export const config = {
  matcher: '/((?!api|studio|static|.*\\..*|_next).*)',
}
