import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma/prisma'

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

    // Check if there's an active promotion
    if ((listing as any).promotionStatus !== 'ACTIVE') {
      return NextResponse.json({ error: 'Listing tidak dalam promosi aktif' }, { status: 400 })
    }

    // Update listing to stop promotion
    await prisma.listing.update({
      where: { id: listing.id },
      data: {
        promotionStatus: 'STOPPED',
        promotionEnd: new Date(),
      } as any
    })

    // Update promotion payment status
    await (prisma as any).promotionPayment.update({
      where: { listingId: listing.id },
      data: {
        status: 'VERIFIED'
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Promosi berhasil dihentikan'
    })

  } catch (error) {
    console.error('Error stopping promotion:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
