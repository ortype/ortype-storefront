import { i18nRouter } from 'next-i18n-router'
import i18nConfig from './i18nConfig'

export function middleware(request) {
  // The i18nRouter function will take the request, detect the user’s
  // preferred language using the accept-language header, and then redirect
  // them to the path with their preferred language. If we don’t support
  // their language, it will fallback to the default language.
  // @NOTE: It also removes the locales segment from the URL for the default langauge
  // @TODO: re-enable this when the migration to the /app directory is complete,
  // until that's done this seems to break the /pages directory
  // return i18nRouter(request, i18nConfig)
}

// applies this middleware only to files in the app directory
export const config = {
  matcher: '/((?!api|static|.*\\..*|_next).*)',
}
