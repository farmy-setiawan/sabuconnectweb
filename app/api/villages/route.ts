import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma/prisma'

export const dynamic = 'force-dynamic'

// GET all active villages (public endpoint for dropdowns)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const district = searchParams.get('district')

    const where: Record<string, unknown> = {
      isActive: true,
    }

    if (district) {
      where.district = district
    }

    const villages = await prisma.village.findMany({
      where,
      select: {
        id: true,
        name: true,
        district: true,
      },
      orderBy: [
        { district: 'asc' },
        { order: 'asc' },
        { name: 'asc' },
      ],
    })

    // Group villages by district for better UX
    const grouped: Record<string, { id: string; name: string; district: string }[]> = {}
    
    for (const village of villages) {
      if (!grouped[village.district]) {
        grouped[village.district] = []
      }
      grouped[village.district].push({
        id: village.id,
        name: village.name,
        district: village.district,
      })
    }

    return NextResponse.json({
      villages,
      grouped,
    })
  } catch (error) {
    console.error('Error fetching villages:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil data desa' },
      { status: 500 }
    )
  }
}
