import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await auth()

    if (!session || (session.user.role !== 'PROVIDER' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const listings = await prisma.listing.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    // Convert to simple format
    const result = listings.map(listing => ({
      id: listing.id,
      title: listing.title,
      description: listing.description,
      slug: listing.slug,
      price: listing.price.toString(),
      category: listing.category,
      images: listing.images,
    }))

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching provider listings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
