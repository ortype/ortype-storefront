import { i18nRouter } from 'next-i18n-router'
import i18nConfig from './i18nConfig'

export function middleware(request) {
  // @TODO: re-enable this when the migration to the /app directory is complete
  // until that's done this seems to break the /pages directory
  // return i18nRouter(request, i18nConfig)
}

// applies this middleware only to files in the app directory
export const config = {
  matcher: '/((?!api|static|.*\\..*|_next).*)',
}
