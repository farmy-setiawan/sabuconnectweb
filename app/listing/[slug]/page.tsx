'use client'

import { useState, useEffect } from 'react'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent } from '@/components/ui/Card'
import { formatPrice, generateWhatsAppLink, formatDate } from '@/lib/utils'
import type { Listing } from '@/types'

interface ListingDetailPageProps {
  params: Promise<{ slug: string }>
}

export default function ListingDetailPage({ params }: ListingDetailPageProps) {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(true)
  const [listing, setListing] = useState<any>(null)

  // Increment views - must be at top level with other hooks
  useEffect(() => {
    if (listing?.slug) {
      fetch(`/api/listings/${listing.slug}`, { method: 'POST' })
    }
  }, [listing])

  useEffect(() => {
    async function fetchListing() {
      try {
        const { slug } = await params
        const response = await fetch(`/api/listings/${slug}`)
        if (response.ok) {
          const data = await response.json()
          setListing(data)
        }
      } catch (error) {
        console.error('Error fetching listing:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchListing()
  }, [params])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!listing) {
    notFound()
  }

  const price = typeof listing.price === 'string' ? parseFloat(listing.price) : listing.price

  const whatsappMessage = `Halo, saya tertarik dengan "${listing.title}" dari SABUConnect`
  const whatsappLink = listing.phone ? generateWhatsAppLink(listing.phone, whatsappMessage) : ''

  const priceLabel =
    listing.priceType === 'NEGOTIABLE'
      ? 'Nego'
      : listing.priceType === 'STARTING_FROM'
      ? 'Mulai dari'
      : ''

  const handleWhatsAppClick = () => {
    if (!session) {
      alert('Silakan login terlebih dahulu untuk menghubungi via WhatsApp')
      router.push('/login')
      return
    }
    window.open(whatsappLink, '_blank')
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-background">
        <div className="container-app py-8">
          {/* Breadcrumb */}
          <nav className="text-sm text-text-secondary mb-6">
            <Link href="/" className="hover:text-primary">Beranda</Link>
            <span className="mx-2">/</span>
            <Link href="/search?q=" className="hover:text-primary">Listing</Link>
            <span className="mx-2">/</span>
            <span className="text-text-primary">{listing.title}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Image Gallery */}
              <div className="bg-white rounded-lg border border-border overflow-hidden">
                {listing.images && listing.images.length > 0 ? (
                  <div className="aspect-video relative">
                    <Image
                      src={listing.images[0]}
                      alt={listing.title}
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-gray-100 flex items-center justify-center">
                    <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Details */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <Badge className="mb-2">{listing.category?.type}</Badge>
                      <h1 className="text-2xl font-bold text-text-primary">{listing.title}</h1>
                      <p className="text-text-secondary">{listing.category?.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-text-secondary mb-6">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {listing.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      {listing.views} views
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {formatDate(listing.createdAt)}
                    </span>
                  </div>

                  <div className="prose max-w-none">
                    <h2 className="text-lg font-semibold mb-2">Deskripsi</h2>
                    <p className="text-text-secondary whitespace-pre-wrap">{listing.description}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Price Card */}
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm text-text-secondary mb-1">
                    {priceLabel && priceLabel}
                  </p>
                  <p className="text-3xl font-bold text-primary">
                    {formatPrice(price)}
                  </p>
                  
                  {/* WhatsApp Button - requires login */}
                  {whatsappLink ? (
                    <div
                      onClick={handleWhatsAppClick}
                      className="block w-full mt-4 cursor-pointer"
                    >
                      <button className="w-full bg-[#25D366] hover:bg-[#20BD5A] text-white font-semibold py-3 px-6 rounded-xl shadow-lg shadow-[#25D366]/20 hover:shadow-[#25D366]/40 transition-all duration-300 flex items-center justify-center gap-3 transform hover:scale-[1.02] active:scale-[0.98]">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                        <span className="text-base">Hubungi via WhatsApp</span>
                      </button>
                    </div>
                  ) : (
                    <div className="mt-4 p-3 bg-gray-100 rounded-lg text-center text-sm text-gray-600">
                      Tidak ada nomor WhatsApp
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Provider Card */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Informasi Penyedia</h3>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-primary font-semibold text-lg">
                        {listing.user?.name?.charAt(0).toUpperCase() || 'P'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{listing.user?.name || 'Penyedia'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
