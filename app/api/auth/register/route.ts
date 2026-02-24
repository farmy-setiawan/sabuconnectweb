import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, name, phone, role = 'USER' } = body

    if (!email || !password || !name || !phone) {
      return NextResponse.json(
        { error: 'Semua field wajib diisi' },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email sudah terdaftar' },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone,
        role: role === 'PROVIDER' ? 'PROVIDER' : 'USER',
        isVerified: role !== 'PROVIDER', // Auto-verify regular users
      },
    })

    return NextResponse.json(
      {
        message: 'Registrasi berhasil',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat registrasi' },
      { status: 500 }
    )
  }
}
