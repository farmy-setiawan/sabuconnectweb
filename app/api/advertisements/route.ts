import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma/prisma'

export const dynamic = 'force-dynamic'
export const revalidate = 60 // Cache for 1 minute

// GET - Fetch advertisements
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // 'PENDING', 'ACTIVE', 'EXPIRED'
    const providerId = searchParams.get('providerId')

    const where: any = {}
    
    if (status) {
      where.status = status
    }
    
    if (providerId) {
      where.providerId = providerId
    }

    const advertisements = await prisma.ad.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        listing: true,
      },
    })

    return NextResponse.json(advertisements)
  } catch (error) {
    console.error('Error fetching advertisements:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil iklan' },
      { status: 500 }
    )
  }
}

// POST - Create new advertisement
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || (session.user.role !== 'PROVIDER' && session.user.role !== 'ADMIN')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { listingId, startDate, endDate, paymentMethod, title, description } = body

    // Debug logging
    console.log('Creating advertisement:', { listingId, startDate, endDate, paymentMethod, userId: session.user.id })

    // Validate required fields
    if (!listingId || !startDate || !endDate || !title) {
      return NextResponse.json(
        { error: 'Data tidak lengkap' },
        { status: 400 }
      )
    }

    // Get the listing to check ownership
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    })

    if (!listing) {
      return NextResponse.json(
        { error: 'Listing tidak ditemukan' },
        { status: 404 }
      )
    }

    // Check if user owns the listing
    if (session.user.role === 'PROVIDER' && listing.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Calculate price based on duration
    const start = new Date(startDate)
    const end = new Date(endDate)
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    const pricePerDay = 10000 // Rp 10,000 per day
    const totalPrice = days * pricePerDay

    // Create advertisement (requires admin approval)
    const advertisement = await prisma.ad.create({
      data: {
        title,
        description,
        listingId,
        providerId: session.user.id,
        startDate: start,
        endDate: end,
        price: totalPrice.toString(),
        status: 'PENDING_APPROVAL',
        paymentMethod,
      },
    })

    return NextResponse.json(advertisement)
  } catch (error) {
    console.error('Error creating advertisement:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat membuat iklan: ' + errorMessage },
      { status: 500 }
    )
  }
}
