'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface PromoBanner {
  id: string
  title: string
  subtitle: string | null
  image: string
  link: string | null
  position: string
}

function PromoBannersContent() {
  const [banners, setBanners] = useState<PromoBanner[]>([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    fetchBanners()
  }, [])

  // Auto-rotate banners
  useEffect(() => {
    if (banners.length <= 1) return
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [banners.length])

  const fetchBanners = async () => {
    try {
      const res = await fetch('/api/promo-banners?position=hero', { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        setBanners(data || [])
      }
    } catch (error) {
      console.error('Error fetching banners:', error)
      setBanners([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-gray-100 to-gray-50 py-4 border-b border-gray-200">
        <div className="container-app">
          <div className="h-24 md:h-32 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 border-2 border-dashed border-primary/20 flex items-center justify-center animate-pulse">
            <div className="text-center">
              <svg className="w-8 h-8 mx-auto text-primary/40 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
              <p className="text-sm text-gray-400 font-medium">Memuat banner...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show placeholder when no banners
  if (!banners || banners.length === 0) {
    return null
  }

  // Handle single banner
  if (banners.length === 1) {
    const banner = banners[0]
    return (
      <div className="bg-gradient-to-r from-gray-100 to-gray-50 py-4 border-b border-gray-200">
        <div className="container-app">
          <Link 
            href={banner.link || '#'}
            className="block relative aspect-[3/1] md:aspect-[4/1] rounded-xl overflow-hidden"
          >
            <img 
              src={banner.image || '/placeholder-banner.jpg'} 
              alt={banner.title || 'Banner'}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = '/placeholder-banner.jpg'
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent flex items-center">
              <div className="p-6 md:p-8">
                <h3 className="text-white text-xl md:text-2xl font-bold mb-2">
                  {banner.title}
                </h3>
                {banner.subtitle && (
                  <p className="text-white/80 text-sm md:text-base">
                    {banner.subtitle}
                  </p>
                )}
              </div>
            </div>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-r from-gray-100 to-gray-50 py-4 border-b border-gray-200">
      <div className="container-app">
        <div className="relative">
          {/* Multiple Banners Carousel */}
          <div className="relative overflow-hidden rounded-xl aspect-[3/1] md:aspect-[4/1]">
            {banners.map((banner, index) => (
              <div 
                key={banner.id}
                className={`absolute inset-0 transition-opacity duration-500 ${
                  index === currentIndex ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <Link 
                  href={banner.link || '#'}
                  className="block relative w-full h-full"
                >
                  <img 
                    src={banner.image || '/placeholder-banner.jpg'} 
                    alt={banner.title || 'Banner'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder-banner.jpg'
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent flex items-center">
                    <div className="p-6 md:p-8">
                      <h3 className="text-white text-xl md:text-2xl font-bold mb-2">
                        {banner.title}
                      </h3>
                      {banner.subtitle && (
                        <p className="text-white/80 text-sm md:text-base">
                          {banner.subtitle}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
          
          {/* Navigation Dots */}
          {banners.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
              {banners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentIndex 
                      ? 'bg-white w-6' 
                      : 'bg-white/50 hover:bg-white/70'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function PromoBanners() {
  return (
    <Suspense fallback={
      <div className="bg-gradient-to-r from-gray-100 to-gray-50 py-4 border-b border-gray-200">
        <div className="container-app">
          <div className="h-24 md:h-32 rounded-xl bg-gray-200 animate-pulse" />
        </div>
      </div>
    }>
      <PromoBannersContent />
    </Suspense>
  )
}
