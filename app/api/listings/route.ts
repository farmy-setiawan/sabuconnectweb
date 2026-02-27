import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma/prisma'
import { slugify } from '@/lib/utils'

export const dynamic = 'force-dynamic'
export const revalidate = 60 // Cache for 60 seconds

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const categoryId = searchParams.get('categoryId')
    const type = searchParams.get('type')
    const location = searchParams.get('location')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const userId = searchParams.get('userId')
    const status = searchParams.get('status')
    const sortBy = searchParams.get('sortBy') || 'newest'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')

    const where: Record<string, unknown> = {}

    // If userId is provided, filter by user (for provider's own listings)
    // Otherwise show only ACTIVE listings (for public search)
    if (userId) {
      where.userId = userId
      // Providers can see all their listings, not just active ones
    } else {
      where.status = 'ACTIVE'
    }

    // Override status if explicitly provided
    if (status) {
      where.status = status
    }

    if (query) {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ]
    }

    if (categoryId) {
      where.categoryId = categoryId
    }

    if (type) {
      where.category = { type }
    }

    if (location) {
      where.location = { contains: location, mode: 'insensitive' }
    }

    if (minPrice || maxPrice) {
      where.price = {}
      if (minPrice) (where.price as Record<string, number>).gte = parseFloat(minPrice)
      if (maxPrice) (where.price as Record<string, number>).lte = parseFloat(maxPrice)
    }

    let orderBy: Record<string, string> = {}
    switch (sortBy) {
      case 'price_asc':
        orderBy = { price: 'asc' }
        break
      case 'price_desc':
        orderBy = { price: 'desc' }
        break
      case 'popular':
        orderBy = { views: 'desc' }
        break
      default:
        orderBy = { createdAt: 'desc' }
    }

    const skip = (page - 1) * limit

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        // Select only needed fields for better performance
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          price: true,
          priceType: true,
          images: true,
          location: true,
          phone: true,
          status: true,
          isFeatured: true,
          views: true,
          userId: true,
          categoryId: true,
          promotionPriority: true,
          promotionStatus: true,
          createdAt: true,
          updatedAt: true,
          // Include related data with select for optimized queries
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
              isVerified: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              type: true,
            },
          },
          promotion: {
            select: {
              id: true,
              status: true,
              createdAt: true,
            },
          },
        },
      }),
      prisma.listing.count({ where }),
    ])

    return NextResponse.json({
      listings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching listings:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    
    if (!session || (session.user.role !== 'PROVIDER' && session.user.role !== 'ADMIN')) {
      return NextResponse.json(
        { error: 'Unauthorized - Hanya provider yang dapat membuat listing' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { title, description, price, priceType, images, location, phone, categoryId } = body

    if (!title || !description || !price || !location || !phone || !categoryId) {
      return NextResponse.json(
        { error: 'Field wajib tidak boleh kosong' },
        { status: 400 }
      )
    }

    // Find category by ID or slug
    let category = await prisma.category.findUnique({
      where: { id: categoryId },
    })
    
    // If not found by ID, try by slug
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

    const slug = slugify(title) + '-' + Date.now()

    const listing = await prisma.listing.create({
      data: {
        title,
        slug,
        description,
        price: parseFloat(price),
        priceType: priceType || 'FIXED',
        images: images || [],
        location,
        phone,
        categoryId: category.id,
        userId: session.user.id,
        status: session.user.role === 'ADMIN' ? 'ACTIVE' : 'PENDING',
      },
    })

    return NextResponse.json(listing, { status: 201 })
  } catch (error) {
    console.error('Error creating listing:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat membuat listing' },
      { status: 500 }
    )
  }
}
