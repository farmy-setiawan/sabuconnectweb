import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma/prisma'

export const dynamic = 'force-dynamic'
export const revalidate = 300 // Cache for 5 minutes

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const position = searchParams.get('position') || 'hero'
    
    const now = new Date()
    
    const banners = await prisma.promoBanner.findMany({
      where: {
        isActive: true,
        position: position,
        OR: [
          { startDate: null, endDate: null },
          { startDate: { lte: now }, endDate: null },
          { startDate: null, endDate: { gte: now } },
          { startDate: { lte: now }, endDate: { gte: now } },
        ],
      },
      orderBy: {
        order: 'asc',
      },
    })

    return NextResponse.json(banners)
  } catch (error) {
    console.error('Error fetching promo banners:', error)
    return NextResponse.json({ error: 'Failed to fetch banners' }, { status: 500 })
  }
}
