import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
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

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    // Build where clause
    const whereClause: any = {}
    
    if (status === 'pending') {
      whereClause.promotionStatus = { in: ['PENDING_APPROVAL', 'WAITING_PAYMENT', 'PAYMENT_UPLOADED'] }
    } else if (status === 'active') {
      whereClause.promotionStatus = 'ACTIVE'
    } else if (status) {
      whereClause.promotionStatus = status
    }

    // Get listings with promotion data
    const listings = await prisma.listing.findMany({
      where: {
        ...whereClause,
        promotionStatus: { not: 'NONE' }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          }
        },
        category: true,
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    // Get promotion payments separately
    const listingIds = listings.map(l => l.id)
    const payments = await (prisma as any).promotionPayment.findMany({
      where: { listingId: { in: listingIds } }
    })

    // Combine data
    const result = listings.map(listing => ({
      ...listing,
      promotion: payments.find((p: any) => p.listingId === listing.id)
    }))

    return NextResponse.json({ promotions: result })

  } catch (error) {
    console.error('Error fetching promotions:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
