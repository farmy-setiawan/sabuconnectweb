'use client'

import { memo, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatPrice, generateWhatsAppLink } from '@/lib/utils'
import type { Listing } from '@/types'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

interface ListingCardProps {
  listing: Listing
}

function ListingCardComponent({ listing }: ListingCardProps) {
  const router = useRouter()
  const { data: session } = useSession()
  
  // Generate WhatsApp link - requires login
  const whatsappMessage = `Halo, saya tertarik dengan "${listing.title}" dari SABUConnect`
  const phoneNumber = listing.phone || ''
  const whatsappLink = phoneNumber ? generateWhatsAppLink(phoneNumber, whatsappMessage) : ''
  const hasWhatsApp = !!phoneNumber

  const handleWhatsAppClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    if (!session) {
      alert('Silakan login terlebih dahulu untuk menghubungi via WhatsApp')
      router.push('/login')
      return
    }
    window.open(whatsappLink, '_blank')
  }, [session, router, whatsappLink])

  // Memoized computed values for performance
  const priceLabel = useMemo(() =>
    listing.priceType === 'NEGOTIABLE'
      ? 'Nego'
      : listing.priceType === 'STARTING_FROM'
      ? 'Mulai dari'
      : '',
    [listing.priceType]
  )

  const categoryType = useMemo(() => listing.category?.type || 'JASA', [listing.category?.type])
  const categoryName = useMemo(() => listing.category?.name || '', [listing.category?.name])
  const isProduct = useMemo(() => categoryType === 'PRODUK', [categoryType])

  const handleClick = useCallback(() => {
    router.push(`/listing/${listing.slug}`)
  }, [router, listing.slug])

  return (
    <div onClick={handleClick} className="cursor-pointer">
      <Card hover className="h-full overflow-hidden group">
        {/* Image */}
        <div className="relative aspect-square md:aspect-[4/3] bg-gray-100 overflow-hidden">
          {listing.images && listing.images.length > 0 ? (
            <img
              src={listing.images[0]}
              alt={listing.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <svg className="w-8 h-8 md:w-12 md:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          
          {/* Top Left - Trusted Badge */}
          {listing.promotionStatus === 'ACTIVE' && (
            <div className="absolute top-2 left-2 md:top-3 md:left-3">
              <Badge className="bg-gradient-to-r from-green-600 to-green-500 text-white shadow-lg shadow-green-600/40 border-0 font-semibold px-1.5 py-0.5 md:px-3 md:py-1.5 flex items-center text-[10px] md:text-xs">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="ml-1">Terpercaya</span>
              </Badge>
            </div>
          )}
          
          {/* Top Right - Verified Badge */}
          {listing.user?.isVerified && (
            <div className="absolute top-2 right-2 md:top-3 md:right-3">
              <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30 border-0 flex items-center gap-1 px-1.5 py-0.5 md:px-3 md:py-1.5 text-[10px] md:text-xs">
                <svg className="w-3 h-3 md:w-3.5 md:h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="hidden md:inline">Terverifikasi</span>
                <span className="md:hidden ml-1">Verified</span>
              </Badge>
            </div>
          )}
          
          {/* Bottom - JASA/PRODUK Badge */}
          <div className="absolute bottom-2 left-2 md:bottom-3 md:left-3">
            <Badge className={`${categoryType === 'JASA' ? 'bg-gradient-to-r from-primary to-green-600' : 'bg-gradient-to-r from-amber-500 to-amber-600'} text-white shadow-lg shadow-black/10 border-0 font-semibold px-2 py-0.5 md:px-3 md:py-1.5 flex items-center gap-1`}>
              {categoryType === 'JASA' ? (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              ) : (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              )}
              <span className="text-[10px] md:text-xs">{categoryType === 'JASA' ? 'JASA' : 'PRODUK'}</span>
            </Badge>
          </div>
        </div>

        <CardContent className="p-2 md:p-4">
          {/* Category - hide on mobile */}
          <p className="text-xs text-gray-500 mb-1 hidden md:block">{categoryName}</p>
          
          {/* Title */}
          <h3 className="font-semibold text-gray-800 mb-1 md:mb-2 line-clamp-2 group-hover:text-primary transition-colors text-sm md:text-base">
            {listing.title}
          </h3>

          {/* Location - hide on mobile */}
          <p className="text-xs text-gray-500 mb-2 hidden md:flex items-center gap-1">
            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {listing.location}
          </p>

          {/* Views - hide on mobile */}
          <div className="flex items-center gap-4 mb-2 hidden md:flex">
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {listing.views != null ? listing.views.toLocaleString('id-ID') : 0}
            </span>
          </div>

          {/* Price */}
          <p className="font-bold text-primary text-sm md:text-lg mb-2 md:mb-3">
            {priceLabel && <span className="text-xs md:text-sm font-normal text-gray-500">{priceLabel} </span>}
            {formatPrice(listing.price)}
          </p>

          {/* Action Button */}
          {isProduct ? (
            // Product: Buy Now button
            hasWhatsApp ? (
              <Button variant="primary" className="w-full h-9 md:h-10 text-xs md:text-sm bg-[#25D366] hover:bg-[#20BD5A] border-none" size="sm" onClick={handleWhatsAppClick}>
                <svg className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                <span className="hidden md:inline">Beli Sekarang</span>
                <span className="md:hidden">Beli</span>
              </Button>
            ) : (
              <Button variant="outline" className="w-full h-9 md:h-10 text-xs" size="sm" disabled>
                Tidak tersedia
              </Button>
            )
          ) : (
            // Service: Contact button
            hasWhatsApp ? (
              <Button variant="secondary" className="w-full h-9 md:h-10 text-xs md:text-sm bg-[#25D366] hover:bg-[#20BD5A] text-white border-none" size="sm" onClick={handleWhatsAppClick}>
                <svg className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                <span className="hidden md:inline">Hubungi via WhatsApp</span>
                <span className="md:hidden">Hubungi</span>
              </Button>
            ) : (
              <Button variant="outline" className="w-full h-9 md:h-10 text-xs" size="sm" disabled>
                Tidak ada WhatsApp
              </Button>
            )
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Memoized export for performance optimization
// Prevents re-render when parent re-renders but props haven't changed
export const ListingCard = memo(ListingCardComponent, (prevProps, nextProps) => {
  // Custom comparison: only re-render if listing data actually changed
  return (
    prevProps.listing.id === nextProps.listing.id &&
    prevProps.listing.title === nextProps.listing.title &&
    prevProps.listing.price === nextProps.listing.price &&
    prevProps.listing.views === nextProps.listing.views &&
    prevProps.listing.updatedAt === nextProps.listing.updatedAt
  )
})

ListingCard.displayName = 'ListingCard'
