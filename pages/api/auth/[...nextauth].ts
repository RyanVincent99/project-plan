// pages/api/auth/[...nextauth].ts
import NextAuth from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import GoogleProvider from 'next-auth/providers/google'
import prisma from '@/lib/prisma'

export default NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
  },
  // --- ADD THIS CALLBACKS SECTION ---
  callbacks: {
    async session({ session, token }) {
      // Add the user ID (which is stored in 'sub' on the token)
      // to the session.user object
      if (token && session.user) {
        session.user.id = token.sub as string;
      }
      return session;
    },
    async jwt({ token, user }) {
      // On sign-in, add the user's ID to the token
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
})