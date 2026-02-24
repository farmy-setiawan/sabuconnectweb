import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma/prisma'

export async function getProviderListings() {
  const session = await auth()

  if (!session || (session.user.role !== 'PROVIDER' && session.user.role !== 'ADMIN')) {
    return []
  }

  try {
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

    return listings.map(listing => ({
      id: listing.id,
      title: listing.title,
      description: listing.description,
      slug: listing.slug,
      price: listing.price.toString(),
      category: listing.category,
      images: listing.images,
    }))
  } catch (error) {
    console.error('Error fetching provider listings:', error)
    return []
  }
}
