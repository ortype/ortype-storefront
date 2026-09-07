import { i18nRouter } from 'next-i18n-router'
import { NextRequest, NextResponse } from 'next/server'
import {
  parseAcceptLanguage,
  PRICE_LOCALE_COOKIE,
  PRICE_LOCALE_HEADER,
} from './commercelayer/utils/price-locale'
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

  // Resolve the EU-vs-US display locale for price formatting from the
  // visitor's Accept-Language header. This is independent of i18n routing
  // (the app is English-only) and works identically in dev and prod.
  const priceLocale = parseAcceptLanguage(request.headers.get('accept-language'))

  // `i18nRouter` internally does `new Headers(request.headers)` to build the
  // request-header override on the response it returns, so we must add our
  // header to the *input* request before calling it — setting it only on the
  // returned response would not propagate to `headers()` in server components.
  const headersWithPriceLocale = new Headers(request.headers)
  headersWithPriceLocale.set(PRICE_LOCALE_HEADER, priceLocale)
  const requestWithPriceLocale = new NextRequest(request, {
    headers: headersWithPriceLocale,
  })

  // Continue with i18n routing using the augmented request
  const response = i18nRouter(requestWithPriceLocale, i18nConfig)

  // Persist the resolved price locale across requests
  response.cookies.set(PRICE_LOCALE_COOKIE, priceLocale, {
    maxAge: 60 * 60 * 24 * 365, // one year
    sameSite: 'lax',
  })

  return applyNoIndexHeaders(request, response)
}

// applies this middleware only to files in the app directory
export const config = {
  matcher: '/((?!api|studio|static|.*\\..*|_next).*)',
}
