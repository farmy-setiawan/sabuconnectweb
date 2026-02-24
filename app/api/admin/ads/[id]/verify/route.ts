import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma/prisma'

export const dynamic = 'force-dynamic'

interface Params {
  params: Promise<{ id: string }>
}

// POST - Verify payment or confirm COD
export async function POST(request: NextRequest, { params }: Params) {
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
    const { action, status } = body // action: 'verify' or 'confirm_cod', status: 'PAID' or 'REJECTED'

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

    // Update payment status
    if (ad.payment) {
      await prisma.payment.update({
        where: { id: ad.payment.id },
        data: {
          status: status === 'PAID' ? 'PAID' : 'PAYMENT_REJECTED',
          verifiedBy: session.user.id,
          verifiedAt: status === 'PAID' ? new Date() : null,
        }
      })
    }

    // Update ad status
    if (status === 'PAID') {
      await prisma.ad.update({
        where: { id },
        data: { 
          status: 'ACTIVE',
          paymentStatus: 'PAID'
        }
      })
    } else {
      await prisma.ad.update({
        where: { id },
        data: { 
          status: 'WAITING_PAYMENT',
          paymentStatus: 'PAYMENT_REJECTED'
        }
      })
    }

    const updatedAd = await prisma.ad.findUnique({
      where: { id },
      include: {
        provider: {
          select: { id: true, name: true, email: true }
        },
        payment: true
      }
    })

    return NextResponse.json(updatedAd)
  } catch (error) {
    console.error('Error verifying payment:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat verifikasi pembayaran' },
      { status: 500 }
    )
  }
}
