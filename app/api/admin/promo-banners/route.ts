import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma/prisma'

export const dynamic = 'force-dynamic'

// GET all promo banners (admin)
export async function GET() {
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

    const banners = await prisma.promoBanner.findMany({
      orderBy: { order: 'asc' }
    })

    return NextResponse.json(banners)
  } catch (error) {
    console.error('Error fetching promo banners:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}

// POST create new promo banner
export async function POST(request: Request) {
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
    const { title, subtitle, image, link, position, isActive, order, startDate, endDate } = body

    if (!title || !image) {
      return NextResponse.json({ error: 'Title dan image wajib diisi' }, { status: 400 })
    }

    const banner = await prisma.promoBanner.create({
      data: {
        title,
        subtitle: subtitle || null,
        image,
        link: link || null,
        position: position || 'hero',
        isActive: isActive ?? true,
        order: order || 0,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      }
    })

    return NextResponse.json(banner)
  } catch (error) {
    console.error('Error creating promo banner:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
