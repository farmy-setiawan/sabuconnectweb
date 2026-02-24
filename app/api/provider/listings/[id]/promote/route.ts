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

    // Check if already has active promotion (using raw query for now since types not generated)
    if ((listing as any).promotionStatus === 'ACTIVE') {
      return NextResponse.json({ error: 'Listing sudah dalam promosi aktif' }, { status: 400 })
    }

    // Calculate total price
    const totalPrice = days * PROMOTION_PRICE_PER_DAY

    // Create promotion payment
    const promotionPayment = await (prisma as any).promotionPayment.upsert({
      where: { listingId: listing.id },
      update: {
        amount: totalPrice,
        method,
        status: 'PENDING',
        proofImage: null,
        rejectionReason: null,
      },
      create: {
        listingId: listing.id,
        providerId: user.id,
        amount: totalPrice,
        method,
        status: 'PENDING',
      }
    })

    // Update listing promotion status
    await prisma.listing.update({
      where: { id: listing.id },
      data: {
        promotionStatus: method === 'COD' ? 'PENDING_APPROVAL' : 'WAITING_PAYMENT',
        promotionDays: days,
        promotionPrice: totalPrice,
        promotionPriority: 0,
      } as any
    })

    return NextResponse.json({
      success: true,
      message: method === 'COD' 
        ? 'Permintaan promosi telah diajukan dan menunggu persetujuan admin'
        : 'Silakan lakukan pembayaran untuk melanjutkan promosi',
      payment: {
        id: promotionPayment.id,
        amount: totalPrice,
        method,
        status: promotionPayment.status
      }
    })

  } catch (error) {
    console.error('Error promoting listing:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
