import jwt, { JWT } from 'jsonwebtoken'
import NextAuth, { NextAuthConfig, Session, User } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'

interface SessionWithToken extends Session {
  id: string
  token: string
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
            id: 'book-admin-1',
            userName: process.env.BOOK_USER,
            name: 'Admin',
            password: process.env.BOOK_PASS,
            email: process.env.BOOK_USER,
          },
        ]
        const user = users.find(
          (user) =>
            user.userName === credentials.username &&
            user.password === credentials.password
        )

        return user ? { id: user.id, name: user.name, email: user.email } : null
      },
    }),
  ],
  session: {
    strategy: 'jwt', // Specify the JWT session strategy
  },
  callbacks: {
    async session({
      session,
      token,
    }: {
      session: Session
      token: JWT
    }): Promise<SessionWithToken> {
      // encode a JWT token
      const encodedToken = jwt.sign(token, process.env.NEXTAUTH_SECRET, {
        algorithm: 'HS256',
      })
      return {
        user: session.user,
        expires: session.expires,
        id: session.user?.id,
        token: encodedToken,
      }
    },
  },
  basePath: BASE_PATH,
  secret: process.env.NEXTAUTH_SECRET,
}

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions)
