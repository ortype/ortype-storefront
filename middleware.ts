import { i18nRouter } from 'next-i18n-router'
import { NextRequest, NextResponse } from 'next/server'
import i18nConfig from './i18nConfig'
/*
import { Authorizer } from '@authorizerdev/authorizer-js'

const authRef = new Authorizer({
  authorizerURL: process.env.AUTHORIZER_URL,
  clientID: process.env.AUTHORIZER_CLIENT_ID,
  redirectURL: process.env.NEXT_PUBIC_STOREFRONT_URL,
})


  if (request.nextUrl.pathname.endsWith('/book')) {
    const token = request.cookies.get('session')?.value

    // console.log('token: ', token)
    console.log('headers: ', request.headers)

    if (!token) {
      // If no token, redirect to login
      // return NextResponse.redirect(new URL('/auth', request.url))
    }

    const isAuthenticated = await authRef.validateSession({
      cookie: token,
    })
    //   errors: [ [ReferenceError: XMLHttpRequest is not defined] ]

    console.log('isAuthenticated: ', isAuthenticated)

    // If the user is authenticated, continue as normal
    if (!isAuthenticated) {
      // return NextResponse.next()
      // Redirect to login page if not authenticated
      // return NextResponse.redirect(new URL('/auth', request.url))
    }
  }

  // otherwise apply the i18nRouter middleware*/

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
