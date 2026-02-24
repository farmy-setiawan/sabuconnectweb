import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma/prisma'

interface Params {
  params: Promise<{ id: string }>
}

// GET - Get ad details
export async function GET(request: Request, { params }: Params) {
  try {
    const session = await auth()
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params

    const ad = await prisma.ad.findUnique({
      where: { id },
      include: {
        provider: {
          select: { id: true, name: true, email: true, phone: true }
        },
        listing: true,
        payment: true
      }
    })

    if (!ad) {
      return NextResponse.json(
        { error: 'Iklan tidak ditemukan' },
        { status: 404 }
      )
    }

    return NextResponse.json(ad)
  } catch (error) {
    console.error('Error fetching ad:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data iklan' },
      { status: 500 }
    )
  }
}

// PATCH - Approve or reject ad
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const session = await auth()
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const { action } = body // 'approve' or 'reject'

    const ad = await prisma.ad.findUnique({
      where: { id },
      include: { payment: true }
    })

    if (!ad) {
      return NextResponse.json(
        { error: 'Iklan tidak ditemukan' },
        { status: 404 }
      )
    }

    if (action === 'approve') {
      // Approve ad - change to WAITING_PAYMENT
      const updatedAd = await prisma.ad.update({
        where: { id },
        data: { status: 'WAITING_PAYMENT' },
        include: {
          provider: {
            select: { id: true, name: true, email: true }
          }
        }
      })
      return NextResponse.json(updatedAd)
    } else if (action === 'reject') {
      // Reject ad
      const updatedAd = await prisma.ad.update({
        where: { id },
        data: { status: 'REJECTED' },
        include: {
          provider: {
            select: { id: true, name: true, email: true }
          }
        }
      })
      return NextResponse.json(updatedAd)
    } else {
      return NextResponse.json(
        { error: 'Action tidak valid' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error updating ad:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat memperbarui iklan' },
      { status: 500 }
    )
  }
}
