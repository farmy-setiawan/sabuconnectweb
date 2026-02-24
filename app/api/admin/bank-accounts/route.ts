import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma/prisma'

export async function GET() {
  try {
    const session = await auth()
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const bankAccounts = await prisma.bankAccount.findMany({
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' },
      ],
    })

    return NextResponse.json(bankAccounts)
  } catch (error) {
    console.error('Error fetching bank accounts:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, accountNumber, accountName, type, isDefault } = body

    if (!name || !accountNumber || !accountName) {
      return NextResponse.json(
        { error: 'Field wajib tidak boleh kosong' },
        { status: 400 }
      )
    }

    // If this is set as default, unset other defaults
    if (isDefault) {
      await prisma.bankAccount.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      })
    }

    const bankAccount = await prisma.bankAccount.create({
      data: {
        name,
        accountNumber,
        accountName,
        type: type || 'BANK',
        isDefault: isDefault || false,
      },
    })

    return NextResponse.json(bankAccount, { status: 201 })
  } catch (error) {
    console.error('Error creating bank account:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat membuat rekening' },
      { status: 500 }
    )
  }
}
