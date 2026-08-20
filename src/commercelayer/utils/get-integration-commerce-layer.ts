import { authenticate } from '@commercelayer/js-auth'
import CommerceLayer from '@commercelayer/sdk'
import CommerceLayerUtils from '@commercelayer/sdk-utils'

/**
 * How long a cached client is reused before re-authenticating.
 *
 * Client-credentials access tokens are generally valid for ~2 hours, but we
 * refresh well ahead of that so a long-lived serverless instance never risks
 * making requests with an expired token.
 */
const TOKEN_TTL_MS = 5 * 60 * 1000 // 5 minutes

// Lazily authenticate and construct the Commerce Layer client on first use.
// This file is imported by a Route Handler, and Next.js imports route
// modules during `next build` to analyze them - a module-scope `await` here
// would make a live network call at build/import time and crash the build
// (or needlessly re-authenticate on every cold start) even when `cl` is
// never actually used.
let cachedClient: ReturnType<typeof CommerceLayer> | null = null
let cachedClientExpiry = 0

// Dedupes concurrent cold-cache callers so they share a single
// authentication request instead of each firing their own.
let inFlightAuth: Promise<ReturnType<typeof CommerceLayer>> | null = null

async function authenticateAndBuildClient(): Promise<
  ReturnType<typeof CommerceLayer>
> {
  const { CL_SYNC_CLIENT_ID, CL_SYNC_CLIENT_SECRET, CL_SLUG } = process.env

  if (!CL_SYNC_CLIENT_ID || !CL_SYNC_CLIENT_SECRET || !CL_SLUG) {
    throw new Error(
      'Missing Commerce Layer integration credentials: CL_SYNC_CLIENT_ID, ' +
        'CL_SYNC_CLIENT_SECRET, and CL_SLUG must all be set',
    )
  }

  // NOTE: authenticate() only accepts a `domain` option (default
  // 'commercelayer.io') for building the shared auth server URL
  // (`https://auth.${domain}/oauth/token`) - it does NOT accept `endpoint`.
  // CL_ENDPOINT is our org-specific REST API base URL (e.g.
  // `https://or-type.commercelayer.io`), used for direct API calls
  // elsewhere - it's unrelated to authentication. Passing it here silently
  // corrupts the token request body and makes the auth server return an
  // error response with no access_token.
  const token = await authenticate('client_credentials', {
    clientId: CL_SYNC_CLIENT_ID,
    clientSecret: CL_SYNC_CLIENT_SECRET,
  })

  const cl = CommerceLayer({
    organization: CL_SLUG,
    accessToken: token.accessToken,
  })
  // https://github.com/commercelayer/commercelayer-sdk-utils#sdk-v6x
  CommerceLayerUtils(cl)

  return cl
}

/**
 * Returns a cached, authenticated Commerce Layer client for server-side
 * integration use (client_credentials grant, `CL_SYNC_*` credentials).
 *
 * Intended for admin/sync-style server code — imports, price calculation,
 * webhooks, and other Route Handlers that need an org-wide client rather
 * than a customer/session-scoped one. For a client built from an
 * already-obtained access token (e.g. a customer's session token), use
 * `getCommerceLayer` instead.
 *
 * The client is lazily created on first use and cached for `TOKEN_TTL_MS`
 * to avoid re-authenticating on every call. This function is intentionally
 * never invoked at module scope: Next.js imports Route Handler modules
 * during `next build` to analyze them, and a module-scope network call
 * here would run at build time (and crash the build).
 *
 * @param options.forceRefresh - Bypass the cache and re-authenticate.
 *   Useful if a downstream request fails with a 401, which likely means
 *   the cached token was revoked or expired early.
 */
export async function getIntegrationCommerceLayer({
  forceRefresh = false,
}: { forceRefresh?: boolean } = {}): Promise<ReturnType<typeof CommerceLayer>> {
  const now = Date.now()
  if (!forceRefresh && cachedClient && now < cachedClientExpiry) {
    return cachedClient
  }

  if (!inFlightAuth) {
    inFlightAuth = authenticateAndBuildClient().finally(() => {
      inFlightAuth = null
    })
  }

  const cl = await inFlightAuth
  cachedClient = cl
  cachedClientExpiry = Date.now() + TOKEN_TTL_MS
  return cl
}

/**
 * Clears the cached integration client, forcing the next call to
 * re-authenticate. Primarily useful in tests.
 */
export function resetIntegrationCommerceLayerCache(): void {
  cachedClient = null
  cachedClientExpiry = 0
  inFlightAuth = null
}
