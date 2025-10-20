// types/next-auth.d.ts
import 'next-auth'
import 'next-auth/jwt'

declare module 'next-auth' {
  /**
   * Extends the built-in session.user type to include the 'id' property.
   */
  interface Session {
    user?: {
      id: string
    } & DefaultSession['user'] // Retain the existing properties: name, email, image
  }
}

declare module 'next-auth/jwt' {
  /**
   * Extends the built-in JWT token type to include the 'sub' (subject) property,
   * which we use to store the user's ID.
   */
  interface JWT {
    sub?: string // Make sub optional or string, as it is on token
  }
}