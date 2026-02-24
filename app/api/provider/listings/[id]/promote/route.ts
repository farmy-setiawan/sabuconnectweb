import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma/prisma'

export const dynamic = 'force-dynamic'

const PROMOTION_PRICE_PER_DAY = 1000

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! }
    })

    if (!user || user.role !== 'PROVIDER') {
      return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 })
    }

    const body = await request.json()
    const { days, method } = body

    if (!days || days < 1) {
      return NextResponse.json({ error: 'Jumlah hari harus minimal 1' }, { status: 400 })
    }

    // Find the listing
    const listing = await prisma.listing.findUnique({
      where: { id: params.id }
    })

    if (!listing) {
      return NextResponse.json({ error: 'Listing tidak ditemukan' }, { status: 404 })
    }

    // Check if listing belongs to this provider
    if (listing.userId !== user.id) {
      return NextResponse.json({ error: 'Listing bukan milik Anda' }, { status: 403 })
    }

    // Check if already has active promotion
    if (listing.promotionStatus === 'ACTIVE') {
      return NextResponse.json({ error: 'Listing sudah dalam promosi aktif' }, { status: 400 })
    }

    // Calculate total price
    const totalPrice = days * PROMOTION_PRICE_PER_DAY

    // Check if promotion payment already exists
    const existingPayment = await prisma.promotionPayment.findUnique({
      where: { listingId: listing.id }
    })

    let promotionPayment
    if (existingPayment) {
      // Update existing payment
      promotionPayment = await prisma.promotionPayment.update({
        where: { listingId: listing.id },
        data: {
          amount: totalPrice,
          method: method as 'COD' | 'TRANSFER',
          status: 'PENDING',
          proofImage: null,
          rejectionReason: null,
        }
      })
    } else {
      // Create new payment
      promotionPayment = await prisma.promotionPayment.create({
        data: {
          listingId: listing.id,
          providerId: user.id,
          amount: totalPrice,
          method: method as 'COD' | 'TRANSFER',
          status: 'PENDING',
        }
      })
    }

    // Update listing promotion status
    await prisma.listing.update({
      where: { id: listing.id },
      data: {
        promotionStatus: method === 'COD' ? 'PENDING_APPROVAL' : 'WAITING_PAYMENT',
        promotionDays: days,
        promotionPrice: totalPrice,
        promotionPriority: 0,
      }
    })

    return NextResponse.json({
      success: true,
      message: method === 'COD' 
        ? 'Permintaan promosi telah diajukan dan menunggu persetujuan admin'
        : 'Silakan lakukan pembayaran untuk melanjutkan promosi',
      payment: {
        id: promotionPayment.id,
        amount: totalPrice,
        method: promotionPayment.method,
        status: promotionPayment.status
      }
    })

  } catch (error) {
    console.error('Error promoting listing:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
