import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma/prisma'

export const dynamic = 'force-dynamic'

// GET single village by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const village = await prisma.village.findUnique({
      where: { id: params.id },
    })

    if (!village) {
      return NextResponse.json(
        { error: 'Desa tidak ditemukan' },
        { status: 404 }
      )
    }

    return NextResponse.json(village)
  } catch (error) {
    console.error('Error fetching village:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil data desa' },
      { status: 500 }
    )
  }
}

// PUT update village
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, district, description, population, area, isActive, order } = body

    if (!name || !district) {
      return NextResponse.json(
        { error: 'Nama desa dan kecamatan wajib diisi' },
        { status: 400 }
      )
    }

    const village = await prisma.village.update({
      where: { id: params.id },
      data: {
        name,
        district,
        description,
        population: population ? parseInt(population) : null,
        area,
        isActive,
        order: order ? parseInt(order) : 0,
      },
    })

    return NextResponse.json(village)
  } catch (error) {
    console.error('Error updating village:', error)
    return NextResponse.json(
      { error: 'Gagal mengupdate data desa' },
      { status: 500 }
    )
  }
}

// DELETE village
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.village.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Desa berhasil dihapus' })
  } catch (error) {
    console.error('Error deleting village:', error)
    return NextResponse.json(
      { error: 'Gagal menghapus data desa' },
      { status: 500 }
    )
  }
}
