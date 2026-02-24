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

    const userId = session.user.id

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
        images: true,
        promotion: true as any,
      } as any,
    })

    return NextResponse.json(listings)
  } catch (error) {
    console.error('Error fetching provider listings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
