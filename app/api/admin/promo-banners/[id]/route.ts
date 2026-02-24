import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma/prisma'

export const dynamic = 'force-dynamic'

// GET single promo banner
export async function GET(
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

    const banner = await prisma.promoBanner.findUnique({
      where: { id: params.id }
    })

    if (!banner) {
      return NextResponse.json({ error: 'Banner tidak ditemukan' }, { status: 404 })
    }

    return NextResponse.json(banner)
  } catch (error) {
    console.error('Error fetching promo banner:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}

// PUT update promo banner
export async function PUT(
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
    const { title, subtitle, image, link, position, isActive, order, startDate, endDate } = body

    const banner = await prisma.promoBanner.update({
      where: { id: params.id },
      data: {
        ...(title && { title }),
        ...(subtitle !== undefined && { subtitle }),
        ...(image && { image }),
        ...(link !== undefined && { link }),
        position: position || 'hero',
        isActive: isActive ?? true,
        order: order || 0,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      }
    })

    return NextResponse.json(banner)
  } catch (error) {
    console.error('Error updating promo banner:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}

// DELETE promo banner
export async function DELETE(
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

    await prisma.promoBanner.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Banner berhasil dihapus' })
  } catch (error) {
    console.error('Error deleting promo banner:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
