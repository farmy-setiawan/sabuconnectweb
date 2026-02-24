import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma/prisma'

interface Params {
  params: Promise<{ id: string }>
}

// POST - Upload payment proof
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const session = await auth()
    
    if (!session || session.user.role !== 'PROVIDER') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const { proofImage } = body

    // Get the ad to verify ownership
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

    // Verify ownership
    if (ad.providerId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Check if ad is in WAITING_PAYMENT status
    if (ad.status !== 'WAITING_PAYMENT') {
      return NextResponse.json(
        { error: 'Iklan tidak dalam status menunggu pembayaran' },
        { status: 400 }
      )
    }

    // Check if payment method is TRANSFER
    if (ad.paymentMethod !== 'TRANSFER') {
      return NextResponse.json(
        { error: 'Metode pembayaran bukan transfer' },
        { status: 400 }
      )
    }

    // Create or update payment record
    const payment = await prisma.payment.upsert({
      where: { adId: id },
      create: {
        adId: id,
        method: 'TRANSFER',
        proofImage,
        status: 'VERIFICATION',
      },
      update: {
        proofImage,
        status: 'VERIFICATION',
      }
    })

    return NextResponse.json(payment)
  } catch (error) {
    console.error('Error uploading payment proof:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat upload bukti transfer' },
      { status: 500 }
    )
  }
}
