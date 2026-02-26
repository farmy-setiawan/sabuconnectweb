import prisma from '@/lib/prisma/prisma'
import { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params

  const listing = await prisma.listing.findUnique({
    where: { slug },
    include: {
      category: true,
      user: {
        select: {
          name: true,
        },
      },
    },
  })

  if (!listing) {
    return {
      title: 'Listing Tidak Ditemukan - SABUConnect',
    }
  }

  const price = typeof listing.price === 'string' ? parseFloat(listing.price) : Number(listing.price)
  const formattedPrice = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(price)

  const listingImage = listing.images && listing.images.length > 0 ? listing.images[0] : ''

  return {
    title: `${listing.title} - ${formattedPrice} | SABUConnect`,
    description: `${listing.title} - ${formattedPrice} di ${listing.location}. Ditemukan di SABUConnect - Platform listing terbaik untuk wilayah Sabu.`,
    openGraph: {
      title: `${listing.title} - ${formattedPrice} | SABUConnect`,
      description: `${listing.title} - ${formattedPrice} di ${listing.location}. Ditemukan di SABUConnect - Platform listing terbaik untuk wilayah Sabu.`,
      type: 'website',
      url: `https://sabuconnect.web.id/listing/${slug}`,
      images: [
        {
          url: `https://sabuconnect.web.id/api/og/${slug}`,
          width: 1200,
          height: 630,
          alt: listing.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${listing.title} - ${formattedPrice} | SABUConnect`,
      description: `${listing.title} - ${formattedPrice} di ${listing.location}. Ditemukan di SABUConnect - Platform listing terbaik untuk wilayah Sabu.`,
      images: [`https://sabuconnect.web.id/api/og/${slug}`],
    },
  }
}
