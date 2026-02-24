import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { status, paymentMethod } = body

    // Get the transaction first
    const transaction = await prisma.transaction.findUnique({
      where: { id: params.id },
    })

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaksi tidak ditemukan' },
        { status: 404 }
      )
    }

    // Check if user is authorized to update this transaction
    const isProvider = session.user.role === 'PROVIDER' && transaction.providerId === session.user.id
    const isCustomer = session.user.role === 'USER' && transaction.customerId === session.user.id
    const isAdmin = session.user.role === 'ADMIN'

    if (!isProvider && !isCustomer && !isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Validate status transitions
    const validTransitions: Record<string, string[]> = {
      PENDING: ['CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['IN_PROGRESS', 'CANCELLED'],
      IN_PROGRESS: ['COMPLETED', 'CANCELLED'],
      COMPLETED: [],
      CANCELLED: [],
    }

    if (!validTransitions[transaction.status]?.includes(status)) {
      return NextResponse.json(
        { error: `Tidak dapat mengubah status dari ${transaction.status} ke ${status}` },
        { status: 400 }
      )
    }

    // Update transaction
    const updatedTransaction = await prisma.transaction.update({
      where: { id: params.id },
      data: {
        status,
        ...(paymentMethod && { paymentMethod }),
      },
    })

    return NextResponse.json(updatedTransaction)
  } catch (error) {
    console.error('Error updating transaction:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat memperbarui transaksi' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const transaction = await prisma.transaction.findUnique({
      where: { id: params.id },
      include: {
        listing: true,
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        provider: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaksi tidak ditemukan' },
        { status: 404 }
      )
    }

    // Check if user is authorized to view this transaction
    const isProvider = session.user.role === 'PROVIDER' && transaction.providerId === session.user.id
    const isCustomer = session.user.role === 'USER' && transaction.customerId === session.user.id
    const isAdmin = session.user.role === 'ADMIN'

    if (!isProvider && !isCustomer && !isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    return NextResponse.json(transaction)
  } catch (error) {
    console.error('Error fetching transaction:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil transaksi' },
      { status: 500 }
    )
  }
}
