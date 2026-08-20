import { i18nRouter } from 'next-i18n-router'
import { NextRequest, NextResponse } from 'next/server'
import i18nConfig from '../i18nConfig'

// Cookie Next.js sets when draft mode is enabled. `draftMode()` from
// `next/headers` is not available in proxy/middleware, so we read the cookie
// directly.
const DRAFT_MODE_COOKIE = '__prerender_bypass'

// TEMPORARY: while the whole site is on staging we don't want any of it
// indexed. Set SITE_INDEXABLE="true" (or delete this flag) at launch. The
// draft-mode check below is permanent and must stay.
const STAGING_NOINDEX = process.env.SITE_INDEXABLE !== 'true'

const NOINDEX_VALUE = 'noindex, nofollow, noarchive, nosnippet'

function isDraftModeEnabled(request: NextRequest): boolean {
  return request.cookies.has(DRAFT_MODE_COOKIE)
}

/**
 * Prevents preview/draft content — and, for now, the entire staging site —
 * from being crawled or indexed.
 */
function applyNoIndexHeaders(
  request: NextRequest,
  response: NextResponse
): NextResponse {
  if (STAGING_NOINDEX || isDraftModeEnabled(request)) {
    response.headers.set('X-Robots-Tag', NOINDEX_VALUE)
  }

  return response
}

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
    return applyNoIndexHeaders(request, authResponse)
  }

  // If auth passed, continue with i18n routing
  return applyNoIndexHeaders(request, i18nRouter(request, i18nConfig))
}

// applies this middleware only to files in the app directory
export const config = {
  matcher: '/((?!api|studio|static|.*\\..*|_next).*)',
}
