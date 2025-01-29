import { i18nRouter } from 'next-i18n-router'
import { NextRequest, NextResponse } from 'next/server'
import i18nConfig from '../i18nConfig'

export async function middleware(request: NextRequest) {
  // The i18nRouter function will take the request, detect the user’s
  // preferred language using the accept-language header, and then redirect
  // them to the path with their preferred language. If we don’t support
  // their language, it will fallback to the default language.
  // @NOTE: It also removes the locales segment from the URL for the default langauge
  return i18nRouter(request, i18nConfig)
}

// applies this middleware only to files in the app directory
export const config = {
  matcher: '/((?!api|studio|static|.*\\..*|_next).*)',
}
