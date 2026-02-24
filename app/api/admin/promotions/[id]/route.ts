import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma/prisma'

export const dynamic = 'force-dynamic'

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

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 })
    }

    const body = await request.json()
    const { action, reason } = body // action: 'approve' | 'reject'

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Aksi tidak valid' }, { status: 400 })
    }

    // Find the listing
    const listing = await prisma.listing.findUnique({
      where: { id: params.id }
    })

    if (!listing) {
      return NextResponse.json({ error: 'Listing tidak ditemukan' }, { status: 404 })
    }

    // Get current promotion status
    const currentStatus = (listing as any).promotionStatus

    if (action === 'approve') {
      // Calculate promotion end date
      const days = (listing as any).promotionDays || 7
      const startDate = new Date()
      const endDate = new Date()
      endDate.setDate(endDate.getDate() + days)

      // Update listing promotion status to ACTIVE
      await prisma.listing.update({
        where: { id: listing.id },
        data: {
          promotionStatus: 'ACTIVE',
          promotionStart: startDate,
          promotionEnd: endDate,
          promotionPriority: 1, // Boost priority for promoted listings
        } as any
      })

      // Update promotion payment status
      await (prisma as any).promotionPayment.update({
        where: { listingId: listing.id },
        data: {
          status: 'VERIFIED',
          verifiedBy: user.id,
          verifiedAt: new Date()
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Promosi berhasil disetujui dan diaktifkan',
        activeUntil: endDate
      })

    } else if (action === 'reject') {
      // Validate rejection reason
      if (!reason) {
        return NextResponse.json({ error: 'Alasan penolakan wajib diisi' }, { status: 400 })
      }

      // Update listing promotion status to REJECTED
      await prisma.listing.update({
        where: { id: listing.id },
        data: {
          promotionStatus: 'REJECTED',
          promotionDays: null,
          promotionPrice: null,
          promotionPriority: 0,
        } as any
      })

      // Update promotion payment status
      await (prisma as any).promotionPayment.update({
        where: { listingId: listing.id },
        data: {
          status: 'REJECTED',
          verifiedBy: user.id,
          verifiedAt: new Date(),
          rejectionReason: reason
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Promosi telah ditolak'
      })
    }

    return NextResponse.json({ error: 'Aksi tidak valid' }, { status: 400 })

  } catch (error) {
    console.error('Error processing promotion:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
