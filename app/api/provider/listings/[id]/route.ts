import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma/prisma'

export const dynamic = 'force-dynamic'

interface Params {
  params: Promise<{ id: string }>
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const session = await auth()
    
    if (!session || (session.user.role !== 'PROVIDER' && session.user.role !== 'ADMIN')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const { title, description, price, priceType, images, location, phone, categoryId } = body

    // Check if listing exists and belongs to user
    const existingListing = await prisma.listing.findUnique({
      where: { id },
    })

    if (!existingListing) {
      return NextResponse.json(
        { error: 'Listing tidak ditemukan' },
        { status: 404 }
      )
    }

    // Check ownership (admin can update any)
    if (session.user.role !== 'ADMIN' && existingListing.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Find category if provided
    let category = null
    if (categoryId) {
      category = await prisma.category.findUnique({
        where: { id: categoryId },
      })
      
      if (!category) {
        category = await prisma.category.findUnique({
          where: { slug: categoryId },
        })
      }

      if (!category) {
        return NextResponse.json(
          { error: 'Kategori tidak valid' },
          { status: 400 }
        )
      }
    }

    // Update listing
    const updateData: Record<string, unknown> = {}

    if (title) updateData.title = title
    if (description) updateData.description = description
    if (price) updateData.price = parseFloat(price)
    if (priceType) updateData.priceType = priceType
    if (images) updateData.images = images
    if (location) updateData.location = location
    if (phone) updateData.phone = phone
    if (category) updateData.categoryId = category.id

    const listing = await prisma.listing.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        category: true
      }
    })

    return NextResponse.json(listing)
  } catch (error) {
    console.error('Error updating listing:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat memperbarui listing' },
      { status: 500 }
    )
  }
}

// DELETE handler for removing a listing
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const session = await auth()
    
    if (!session || (session.user.role !== 'PROVIDER' && session.user.role !== 'ADMIN')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params

    // Check if listing exists and belongs to user
    const existingListing = await prisma.listing.findUnique({
      where: { id },
    })

    if (!existingListing) {
      return NextResponse.json(
        { error: 'Listing tidak ditemukan' },
        { status: 404 }
      )
    }

    // Check ownership (admin can delete any)
    if (session.user.role !== 'ADMIN' && existingListing.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Delete the listing (cascades to related records)
    await prisma.listing.delete({
      where: { id },
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Listing berhasil dihapus' 
    })
  } catch (error) {
    console.error('Error deleting listing:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat menghapus listing' },
      { status: 500 }
    )
  }
}
