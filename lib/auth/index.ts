import jwt from 'jsonwebtoken'
import NextAuth, { NextAuthConfig, Session, User } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'

interface JWT {
  name?: string
  email?: string
  picture?: string
  sub?: string
  accessToken?: string
  iat?: number
  exp?: number
  jti?: string
}

export const BASE_PATH = '/api/auth'

const authOptions: NextAuthConfig = {
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text', placeholder: '' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials): Promise<User | null> {
        const users = [
          {
            id: 'test-user-1',
            userName: 'test1',
            name: 'Test 1',
            password: 'pass',
            email: 'test1@donotreply.com',
          },
          {
            id: 'test-user-2',
            userName: 'test2',
            name: 'Test 2',
            password: 'pass',
            email: 'test2@donotreply.com',
          },
        ]
        const user = users.find(
          (user) =>
            user.userName === credentials.username &&
            user.password === credentials.password
        )

        // If no user or authentication failed
        if (!user) {
          return null
        }

        // If successful, create a JWT token
        const jwtToken = jwt.sign(user, process.env.JWT_SECRET, {
          expiresIn: '3000h',
        })

        console.log('authorize: ', jwtToken)

        // Return user object along with token
        return { ...user, token: jwtToken }
      },
    }),
  ],
  session: {
    strategy: 'jwt', // Specify the JWT session strategy
  },
  callbacks: {
    async jwt({ token, user }): Promise<JWT> {
      console.log('callbacks!! jwt', token)
      if (user) {
        console.log('jwt: user: ', user)
        token.accessToken = user.accessToken
      }
      return token
    },
    async session({ session, token }): Promise<Session> {
      console.log('callbacks!! session: accessToken: ', token.accessToken)
      session.accessToken = token.accessToken
      return session
    },
  },
  basePath: BASE_PATH,
  secret: process.env.NEXTAUTH_SECRET,
}

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions)
