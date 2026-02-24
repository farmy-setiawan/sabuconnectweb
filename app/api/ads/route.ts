import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma/prisma'

// GET - Fetch ads for provider
export async function GET(request: Request) {
  try {
    const session = await auth()
    
    if (!session || (session.user.role !== 'PROVIDER' && session.user.role !== 'ADMIN')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const where: Record<string, unknown> = {}
    
    // Providers can only see their own ads
    if (session.user.role === 'PROVIDER') {
      where.providerId = session.user.id
    }
    
    if (status) {
      where.status = status
    }

    const ads = await prisma.ad.findMany({
      where,
      include: {
        provider: {
          select: { id: true, name: true, email: true }
        },
        listing: true,
        payment: true
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(ads)
  } catch (error) {
    console.error('Error fetching ads:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data iklan' },
      { status: 500 }
    )
  }
}

// POST - Create new ad
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
    const { title, description, location, price, startDate, endDate, paymentMethod, listingId } = body

    // Validate required fields
    if (!title || !price || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Data tidak lengkap' },
        { status: 400 }
      )
    }

    // Check if listing exists and belongs to provider
    if (listingId) {
      const listing = await prisma.listing.findFirst({
        where: {
          id: listingId,
          userId: session.user.id
        }
      })
      
      if (!listing) {
        return NextResponse.json(
          { error: 'Listing tidak ditemukan' },
          { status: 400 }
        )
      }
    }

    // Calculate duration in days
    const start = new Date(startDate)
    const end = new Date(endDate)
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    
    if (days <= 0) {
      return NextResponse.json(
        { error: 'Tanggal berakhir harus setelah tanggal mulai' },
        { status: 400 }
      )
    }

    // Create ad with PENDING_APPROVAL status
    const ad = await prisma.ad.create({
      data: {
        title,
        description,
        location,
        price: price.toString(),
        startDate: start,
        endDate: end,
        paymentMethod: paymentMethod || 'TRANSFER',
        status: 'PENDING_APPROVAL',
        paymentStatus: 'UNPAID',
        providerId: session.user.id,
        listingId: listingId || null,
      },
      include: {
        provider: {
          select: { id: true, name: true, email: true }
        },
        listing: {
          select: { id: true, title: true, slug: true }
        }
      }
    })

    return NextResponse.json(ad)
  } catch (error) {
    console.error('Error creating ad:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat membuat iklan' },
      { status: 500 }
    )
  }
}
