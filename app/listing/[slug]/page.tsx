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
  const [selectedImage, setSelectedImage] = useState(0)
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)

  // Increment views
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (!listing) {
    notFound()
  }

  const price = typeof listing.price === 'string' ? parseFloat(listing.price) : listing.price

  const whatsappMessage = `Halo, saya tertarik dengan "${listing.title}" dari SABUConnect yang berlokasi di ${listing.location}`
  const whatsappLink = listing.phone ? generateWhatsAppLink(listing.phone, whatsappMessage) : ''

  const priceLabel =
    listing.priceType === 'NEGOTIABLE'
      ? 'Harga Nego'
      : listing.priceType === 'STARTING_FROM'
      ? 'Mulai dari'
      : 'Harga'

  const handleWhatsAppClick = () => {
    if (!session) {
      alert('Silakan login terlebih dahulu untuk menghubungi via WhatsApp')
      router.push('/login')
      return
    }
    window.open(whatsappLink, '_blank')
  }

  const images = listing.images && listing.images.length > 0 ? listing.images : []

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex items-center gap-2 text-sm">
              <Link href="/" className="text-gray-500 hover:text-green-600 transition-colors">
                Beranda
              </Link>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <Link href="/search" className="text-gray-500 hover:text-green-600 transition-colors">
                Listing
              </Link>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-gray-900 font-medium truncate max-w-xs">{listing.title}</span>
            </nav>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content - Left Side */}
            <div className="lg:col-span-2 space-y-6">
              {/* Image Gallery */}
              <Card className="overflow-hidden border-0 shadow-md">
                {/* Main Image */}
                <div 
                  className="relative aspect-video bg-gray-100 cursor-pointer group"
                  onClick={() => images.length > 0 && setIsImageModalOpen(true)}
                >
                  {images.length > 0 ? (
                    <>
                      <Image
                        src={images[selectedImage]}
                        alt={listing.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                        priority
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                      <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Lihat Galeri
                      </div>
                    </>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <svg className="w-20 h-20 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="mt-2 text-gray-400">Tidak ada gambar</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Thumbnail Gallery */}
                {images.length > 1 && (
                  <div className="p-4 bg-gray-50">
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {images.map((img: string, index: number) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImage(index)}
                          className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                            selectedImage === index 
                              ? 'border-green-600 ring-2 ring-green-600/30' 
                              : 'border-transparent hover:border-gray-300'
                          }`}
                        >
                          <Image
                            src={img}
                            alt={`${listing.title} - Gambar ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </Card>

              {/* Title & Info Card */}
              <Card className="border-0 shadow-md">
                <CardContent className="p-6">
                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge className="bg-green-600 text-white font-medium px-3 py-1">
                      {listing.category?.type === 'JASA' ? 'JASA' : 'PRODUK'}
                    </Badge>
                    {listing.promotionStatus === 'ACTIVE' && (
                      <Badge className="bg-green-500 text-white font-medium px-3 py-1">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        Promosi
                      </Badge>
                    )}
                  </div>

                  {/* Title */}
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                    {listing.title}
                  </h1>

                  {/* Category */}
                  <p className="text-gray-600 mb-4">
                    {listing.category?.name}
                  </p>

                  {/* Quick Info */}
                  <div className="flex flex-wrap items-center gap-4 py-4 border-y border-gray-100">
                    <div className="flex items-center gap-2 text-gray-600">
                      <div className="w-8 h-8 bg-green-50 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <span className="text-sm">{listing.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </div>
                      <span className="text-sm">{listing.views} kali dilihat</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <div className="w-8 h-8 bg-purple-50 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <span className="text-sm">Diposting {formatDate(listing.createdAt)}</span>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mt-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-3">Deskripsi</h2>
                    <div className="prose prose-gray max-w-none">
                      <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">
                        {listing.description}
                      </p>
                    </div>
                  </div>

                  {/* Share */}
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Bagikan listing ini:</span>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            if (navigator.share) {
                              navigator.share({
                                title: listing.title,
                                text: `Lihat listing "${listing.title}" di SABUConnect`,
                                url: window.location.href,
                              })
                            }
                          }}
                          className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                          title="Bagikan"
                        >
                          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(window.location.href)
                            alert('Link berhasil disalin!')
                          }}
                          className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                          title="Salin Link"
                        >
                          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar - Right Side */}
            <div className="space-y-6">
              {/* Price Card */}
              <Card className="border-0 shadow-lg sticky top-24">
                <CardContent className="p-6">
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-1">{priceLabel}</p>
                    <p className="text-3xl font-bold text-green-600">
                      {formatPrice(price)}
                    </p>
                    {listing.priceType === 'NEGOTIABLE' && (
                      <p className="text-sm text-gray-500 mt-1">Harga dapat dinegosiasikan</p>
                    )}
                  </div>

                  {/* CTA Buttons */}
                  <div className="space-y-3">
                    {whatsappLink ? (
                      <>
                        <button
                          onClick={handleWhatsAppClick}
                          className="w-full bg-[#25D366] hover:bg-[#20BD5A] text-white font-semibold py-4 px-6 rounded-xl shadow-lg shadow-[#25D366]/20 hover:shadow-[#25D366]/40 transition-all duration-300 flex items-center justify-center gap-3 transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.89 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                          </svg>
                          <span className="text-lg">Hubungi via WhatsApp</span>
                        </button>
                        <p className="text-center text-sm text-gray-500">
                          Klik untuk memulai percakapan
                        </p>
                      </>
                    ) : (
                      <div className="p-4 bg-gray-100 rounded-xl text-center text-gray-600">
                        <svg className="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Tidak ada nomor WhatsApp
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Provider Card */}
              <Card className="border-0 shadow-md">
                <CardContent className="p-4 md:p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Informasi Penyedia</h3>
                  <div className="flex items-center gap-3 md:gap-4 mb-4">
                    <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg md:text-xl">
                      {listing.user?.name?.charAt(0).toUpperCase() || 'P'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900">{listing.user?.name || 'Penyedia'}</p>
                        {listing.user?.isVerified && (
                          <Badge className="bg-green-500 text-white text-[10px] px-2">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Verified
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs md:text-sm text-gray-500">Anggota sejak {listing.user?.createdAt ? formatDate(listing.user.createdAt) : 'Baru'}</p>
                    </div>
                  </div>
                  
                  {session?.user?.id !== listing.userId && (
                    <Link href={`/provider/${listing.userId}`} className="block">
                      <button className="w-full border-2 border-green-600 text-green-600 font-semibold py-3 px-6 rounded-xl hover:bg-green-600 hover:text-white transition-all duration-300">
                        Lihat Profil Penyedia
                      </button>
                    </Link>
                  )}
                </CardContent>
              </Card>

              {/* Safety Tips Card */}
              <Card className="border border-amber-200 bg-amber-50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-amber-800 text-sm">Tips Keamanan</h4>
                      <p className="text-xs text-amber-700 mt-1">
                        Selalu verifikasi informasi sebelum melakukan transaksi. Gunakan fitur chat untuk komunikasi.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Image Modal */}
      {isImageModalOpen && images.length > 0 && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
          onClick={() => setIsImageModalOpen(false)}
        >
          <button 
            className="absolute top-4 right-4 text-white p-2 hover:bg-white/20 rounded-full transition-colors"
            onClick={() => setIsImageModalOpen(false)}
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <button 
            className="absolute left-4 text-white p-2 hover:bg-white/20 rounded-full transition-colors"
            onClick={(e) => {
              e.stopPropagation()
              setSelectedImage((prev) => (prev > 0 ? prev - 1 : images.length - 1))
            }}
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <div className="relative w-full max-w-4xl h-[80vh] p-4" onClick={(e) => e.stopPropagation()}>
            <Image
              src={images[selectedImage]}
              alt={listing.title}
              fill
              className="object-contain"
            />
          </div>
          
          <button 
            className="absolute right-4 text-white p-2 hover:bg-white/20 rounded-full transition-colors"
            onClick={(e) => {
              e.stopPropagation()
              setSelectedImage((prev) => (prev < images.length - 1 ? prev + 1 : 0))
            }}
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
            {images.map((_: string, index: number) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedImage(index)
                }}
                className={`w-3 h-3 rounded-full transition-colors ${
                  selectedImage === index ? 'bg-white' : 'bg-white/40'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
