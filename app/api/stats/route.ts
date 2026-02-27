import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma/prisma'

export const dynamic = 'force-dynamic'
export const revalidate = 60 // Cache for 60 seconds

// GET /api/stats - Get statistics for homepage
export async function GET() {
  try {
    const [providerCount, activeListingsCount, userCount, categoryCount] = await Promise.all([
      prisma.user.count({ where: { role: 'PROVIDER' } }),
      prisma.listing.count({ where: { status: 'ACTIVE' } }),
      prisma.user.count(),
      prisma.category.count(),
    ])

    return NextResponse.json({
      providers: providerCount,
      activeListings: activeListingsCount,
      users: userCount,
      categories: categoryCount,
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      {
        providers: 0,
        activeListings: 0,
        users: 0,
        categories: 0,
      },
      { status: 500 }
    )
  }
}
