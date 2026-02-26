import { ImageResponse } from 'next/og'
import prisma from '@/lib/prisma/prisma'

export const runtime = 'edge'

export const alt = 'SABUConnect Listing'
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  // Fetch listing data
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
    return new ImageResponse(
      (
        <div
          style={{
            background: '#16a34a',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div style={{ color: 'white', fontSize: 48, fontWeight: 'bold' }}>
            SABUConnect
          </div>
          <div style={{ color: 'white', fontSize: 24, marginTop: 10 }}>
            Listing Tidak Ditemukan
          </div>
        </div>
      ),
      { ...size }
    )
  }

  const price = typeof listing.price === 'string' ? parseFloat(listing.price) : listing.price
  const formattedPrice = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(price)

  const listingImage = listing.images && listing.images.length > 0 ? listing.images[0] : null

  // Create the OG image
  return new ImageResponse(
    (
      <div
        style={{
          background: '#ffffff',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header with gradient */}
        <div
          style={{
            background: 'linear-gradient(to right, #16a34a, #22c55e)',
            width: '100%',
            height: '120px',
            display: 'flex',
            alignItems: 'center',
            paddingLeft: '40px',
          }}
        >
          <span style={{ color: 'white', fontSize: 36, fontWeight: 'bold' }}>
            SABUConnect
          </span>
        </div>

        {/* Main content */}
        <div
          style={{
            display: 'flex',
            flex: 1,
            padding: '30px',
            gap: '30px',
          }}
        >
          {/* Image section */}
          <div
            style={{
              width: '400px',
              height: '300px',
              background: listingImage ? '#f3f4f6' : '#e5e7eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '16px',
              overflow: 'hidden',
            }}
          >
            {listingImage ? (
              <img
                src={listingImage}
                alt={listing.title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            ) : (
              <span style={{ color: '#9ca3af', fontSize: 24 }}>No Image</span>
            )}
          </div>

          {/* Details section */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            {/* Category badge */}
            <div
              style={{
                background: '#dcfce7',
                color: '#166534',
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: 18,
                fontWeight: 500,
                alignSelf: 'flex-start',
                marginBottom: '16px',
              }}
            >
              {listing.category?.name || 'Listing'}
            </div>

            {/* Title */}
            <h1
              style={{
                fontSize: 36,
                fontWeight: 'bold',
                color: '#111827',
                marginBottom: '12px',
                lineHeight: 1.2,
              }}
            >
              {listing.title}
            </h1>

            {/* Location */}
            <p
              style={{
                fontSize: 22,
                color: '#6b7280',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              📍 {listing.location}
            </p>

            {/* Price */}
            <div
              style={{
                fontSize: 40,
                fontWeight: 'bold',
                color: '#16a34a',
              }}
            >
              {formattedPrice}
            </div>

            {/* Posted by */}
            <p
              style={{
                fontSize: 18,
                color: '#9ca3af',
                marginTop: '16px',
              }}
            >
              Posted by {listing.user?.name || 'SABUConnect'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            background: '#f9fafb',
            width: '100%',
            height: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span style={{ color: '#6b7280', fontSize: 18 }}>
            Kunjugi sabuconnect.web.id untuk melihat detail lengkap
          </span>
        </div>
      </div>
    ),
    { ...size }
  )
}
