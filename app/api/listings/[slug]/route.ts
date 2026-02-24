import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    
    const listing = await prisma.listing.findUnique({
      where: { slug },
      include: {
        category: true,
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            phone: true,
          },
        },
        promotion: true as any,
      } as any,
    })

    if (!listing) {
      return NextResponse.json(
        { error: 'Listing tidak ditemukan' },
        { status: 404 }
      )
    }

    return NextResponse.json(listing)
  } catch (error) {
    console.error('Error fetching listing:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil listing' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    
    // Increment views
    await prisma.listing.update({
      where: { slug },
      data: { views: { increment: 1 } },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error incrementing views:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan' },
      { status: 500 }
    )
  }
}
