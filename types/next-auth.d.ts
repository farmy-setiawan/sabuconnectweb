import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface User {
    id: string
    role: string
    phone: string
    isVerified: boolean
  }

  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: string
      phone: string
      isVerified: boolean
      image?: string | null
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: string
    phone: string
    isVerified: boolean
  }
}
