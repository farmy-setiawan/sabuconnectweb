import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma/prisma'

export const dynamic = 'force-dynamic'

// GET all villages or create new village
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const district = searchParams.get('district')
    const active = searchParams.get('active')
    const search = searchParams.get('search')

    const where: Record<string, unknown> = {}

    if (district) {
      where.district = district
    }

    if (active !== null) {
      where.isActive = active === 'true'
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { district: { contains: search, mode: 'insensitive' } },
      ]
    }

    const villages = await prisma.village.findMany({
      where,
      orderBy: [
        { order: 'asc' },
        { name: 'asc' },
      ],
    })

    // Get unique districts for filtering
    const districts = await prisma.village.findMany({
      select: { district: true },
      distinct: ['district'],
      orderBy: { district: 'asc' },
    })

    return NextResponse.json({
      villages,
      districts: districts.map((d: { district: string }) => d.district),
    })
  } catch (error) {
    console.error('Error fetching villages:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil data desa' },
      { status: 500 }
    )
  }
}

// POST create new village
export async function POST(request: Request) {
  try {
    const session = await auth()
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, district, description, population, area, isActive, order } = body

    if (!name || !district) {
      return NextResponse.json(
        { error: 'Nama desa dan kecamatan wajib diisi' },
        { status: 400 }
      )
    }

    const village = await prisma.village.create({
      data: {
        name,
        district,
        description,
        population: population ? parseInt(population) : null,
        area,
        isActive: isActive ?? true,
        order: order ? parseInt(order) : 0,
      },
    })

    return NextResponse.json(village, { status: 201 })
  } catch (error) {
    console.error('Error creating village:', error)
    return NextResponse.json(
      { error: 'Gagal membuat data desa' },
      { status: 500 }
    )
  }
}
