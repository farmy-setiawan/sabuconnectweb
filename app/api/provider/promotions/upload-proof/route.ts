import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma/prisma'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! }
    })

    if (!user || user.role !== 'PROVIDER') {
      return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 })
    }

    const formData = await request.formData()
    const proof = formData.get('proof') as File | null
    const listingId = formData.get('listingId') as string

    if (!proof) {
      return NextResponse.json({ error: 'Bukti pembayaran wajib diupload' }, { status: 400 })
    }

    if (!listingId) {
      return NextResponse.json({ error: 'ID listing wajib disediakan' }, { status: 400 })
    }

    // Find the listing
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: { promotion: true } as any
    })

    if (!listing) {
      return NextResponse.json({ error: 'Listing tidak ditemukan' }, { status: 404 })
    }

    // Check if listing belongs to this provider
    if (listing.userId !== user.id) {
      return NextResponse.json({ error: 'Listing bukan milik Anda' }, { status: 403 })
    }

    // Check if there's a pending payment
    if (!listing.promotion) {
      return NextResponse.json({ error: 'Tidak ada pembayaran yang pending' }, { status: 400 })
    }

    // Save the proof image
    const bytes = await proof.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'promotions')
    await mkdir(uploadDir, { recursive: true })
    
    const fileName = `promotion_${listingId}_${Date.now()}.${proof.name.split('.').pop()}`
    const filePath = path.join(uploadDir, fileName)
    await writeFile(filePath, buffer)

    const proofUrl = `/uploads/promotions/${fileName}`

    // Update promotion payment with proof
    await (prisma as any).promotionPayment.update({
      where: { listingId: listing.id },
      data: {
        proofImage: proofUrl,
        status: 'PENDING' // Will be verified by admin
      }
    })

    // Update listing status
    await prisma.listing.update({
      where: { id: listing.id },
      data: {
        promotionStatus: 'PAYMENT_UPLOADED'
      } as any
    })

    return NextResponse.json({
      success: true,
      message: 'Bukti pembayaran telah diupload dan menunggu verifikasi admin',
      proofUrl
    })

  } catch (error) {
    console.error('Error uploading payment proof:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
