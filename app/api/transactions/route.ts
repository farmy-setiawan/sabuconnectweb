import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma/prisma'

export async function GET(request: Request) {
  try {
    const session = await auth()
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role') // 'customer' or 'provider'

    const where = session.user.role === 'ADMIN' 
      ? {} 
      : role === 'provider'
        ? { providerId: session.user.id }
        : { customerId: session.user.id }

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        listing: {
          include: {
            category: true,
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        provider: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    })

    return NextResponse.json(transactions)
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data transaksi' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { listingId, paymentMethod, notes, amount } = body

    if (!listingId || !amount) {
      return NextResponse.json(
        { error: 'Listing dan jumlah wajib diisi' },
        { status: 400 }
      )
    }

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    })

    if (!listing) {
      return NextResponse.json(
        { error: 'Listing tidak ditemukan' },
        { status: 404 }
      )
    }

    // Check if user is trying to buy their own listing
    if (listing.userId === session.user.id) {
      return NextResponse.json(
        { error: 'Anda tidak dapat memesan listing Anda sendiri' },
        { status: 400 }
      )
    }

    const transaction = await prisma.transaction.create({
      data: {
        listingId,
        customerId: session.user.id,
        providerId: listing.userId,
        paymentMethod: paymentMethod || null,
        notes: notes || null,
        amount: parseFloat(amount),
        status: 'PENDING',
      },
    })

    return NextResponse.json(transaction, { status: 201 })
  } catch (error) {
    console.error('Error creating transaction:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat membuat transaksi' },
      { status: 500 }
    )
  }
}
