import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'

import { DrizzleAdapter } from '@auth/drizzle-adapter'
import { db } from '@/lib/db'
import { users, accounts, sessions, verificationTokens, admins } from '@/lib/schema'
import { eq } from 'drizzle-orm'

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      console.log('[signIn] user.email:', user.email)
      console.log('[signIn] ADMIN_EMAIL:', process.env.ADMIN_EMAIL)
      if (!user.email || !process.env.ADMIN_EMAIL) {
        console.log('[signIn] missing email or ADMIN_EMAIL')
        return false
      }
      if (user.email.toLowerCase().trim() === process.env.ADMIN_EMAIL.toLowerCase().trim()) {
        console.log('[signIn] matches ADMIN_EMAIL')
        return true
      }
      const autorizado = await db.query.admins.findFirst({
        where: eq(admins.email, user.email),
      })
      console.log('[signIn] autorizado:', autorizado)
      return !!autorizado
    },
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id
      }
      return session
    },
  },
  pages: {
    signIn: '/admin/login',
    error: '/admin/login',
  },
})

export const { GET, POST } = handlers
