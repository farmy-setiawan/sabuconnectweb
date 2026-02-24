import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/Button'
import { ListingCard } from '@/components/listings/ListingCard'
import { PromoBanners } from '@/components/home/PromoBanners'
import { MobileLayout } from '@/components/home/MobileLayout'
import prisma from '@/lib/prisma/prisma'
import { APP_NAME } from '@/lib/constants'

// Use revalidation for ISR - better than force-dynamic for caching
// This allows the page to be cached but revalidated every 60 seconds
export const revalidate = 60

async function getFeaturedListings() {
  try {
    const listings = await prisma.listing.findMany({
      where: {
        status: 'ACTIVE',
      },
      orderBy: [
        { isFeatured: 'desc' },
        { promotionPriority: 'desc' },
        { views: 'desc' },
        { createdAt: 'desc' },
      ],
      take: 8,
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
        createdAt: true,
        updatedAt: true,
        promotionStatus: true,
        promotionEnd: true,
        category: true,
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            isVerified: true,
          },
        },
      },
    })
    return listings
  } catch {
    return []
  }
}

async function getCategories() {
  try {
    const categories = await prisma.category.findMany({
      where: {
        parentId: null,
      },
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { listings: { where: { status: 'ACTIVE' } } },
        },
      },
    })
    return categories
  } catch {
    return []
  }
}

// Get stats for homepage
async function getStats() {
  try {
    const [providerCount, activeListingsCount, userCount, categoryCount] = await Promise.all([
      prisma.user.count({ where: { role: 'PROVIDER' } }),
      prisma.listing.count({ where: { status: 'ACTIVE' } }),
      prisma.user.count(),
      prisma.category.count(),
    ])
    return {
      providers: providerCount,
      activeListings: activeListingsCount,
      users: userCount,
      categories: categoryCount,
    }
  } catch {
    return {
      providers: 0,
      activeListings: 0,
      users: 0,
      categories: 0,
    }
  }
}

// Featured categories for the icon grid
const FEATURED_CATEGORIES = [
  { name: 'Jasa', icon: 'briefcase', type: 'JASA' },
  { name: 'Produk', icon: 'shopping-bag', type: 'PRODUK' },
]

export default async function HomePage() {
  const [listings, categories, stats] = await Promise.all([
    getFeaturedListings(),
    getCategories(),
    getStats(),
  ])

  // Separate services and products
  const services = listings.filter(l => l.category?.type === 'JASA')
  const products = listings.filter(l => l.category?.type === 'PRODUK')

  return (
    <MobileLayout>
      <Header />

      <div className="flex-1">
      {/* Hero Section - Trust & Brand */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-primary-dark">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url("/images/hero-bg.jpg")' }}
        />
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/80 to-primary-dark/90" />
        
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-40 md:w-96 h-40 md:h-96 bg-white rounded-full blur-2xl md:blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-32 md:w-80 h-32 md:h-80 bg-white rounded-full blur-2xl md:blur-3xl translate-x-1/2 translate-y-1/2" />
        </div>
        
        <div className="container-app py-8 md:py-24 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 md:px-4 md:py-2 rounded-full mb-4 md:mb-6">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
              <span className="text-white/90 text-xs md:text-sm font-medium">Platform Resmi Kabupaten Sabu Raijua</span>
            </div>
            
            <h1 className="text-xl md:text-4xl lg:text-5xl font-bold text-white mb-3 md:mb-5 text-balance leading-tight">
              Platform Layanan & Ekonomi Digital Sabu Raijua
            </h1>
            
            <p className="text-sm md:text-xl text-white/85 mb-6 md:mb-8 text-balance max-w-2xl mx-auto">
              Menghubungkan warga, UMKM, dan layanan publik dalam satu platform terpercaya.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 md:gap-3 justify-center px-2 md:px-0">
              <Link href="/search?type=JASA" className="w-full md:w-auto">
                <Button size="lg" className="w-full md:w-auto bg-amber-500 text-white hover:bg-amber-600 font-semibold shadow-lg px-6 md:px-8 h-12 md:h-14">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span className="text-sm md:text-base">Cari Jasa</span>
                </Button>
              </Link>
              <Link href="/search?type=PRODUK" className="w-full md:w-auto">
                <Button size="lg" className="w-full md:w-auto bg-primary text-white hover:bg-primary-dark font-semibold shadow-lg px-6 md:px-8 h-12 md:h-14">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <span className="text-sm md:text-base">Jelajahi Produk</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Promo Banners - From Admin */}
      <PromoBanners />

      {/* Stats Section - Dynamic with Animation */}
      <section className="bg-white py-10 shadow-sm">
        <div className="container-app">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-3 group-hover:bg-primary/20 transition-colors">
                <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <p className="text-2xl md:text-3xl font-bold text-primary animate-bounce">{stats.providers}+</p>
              <p className="text-sm text-gray-500">Provider Terdaftar</p>
            </div>
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-3 group-hover:bg-primary/20 transition-colors">
                <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <p className="text-2xl md:text-3xl font-bold text-primary animate-bounce" style={{ animationDelay: '0.1s' }}>{stats.activeListings}+</p>
              <p className="text-sm text-gray-500">Listing Aktif</p>
            </div>
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-3 group-hover:bg-primary/20 transition-colors">
                <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <p className="text-2xl md:text-3xl font-bold text-primary animate-bounce" style={{ animationDelay: '0.2s' }}>{stats.users}+</p>
              <p className="text-sm text-gray-500">Pengguna Aktif</p>
            </div>
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-3 group-hover:bg-primary/20 transition-colors">
                <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </div>
              <p className="text-2xl md:text-3xl font-bold text-primary animate-bounce" style={{ animationDelay: '0.3s' }}>{stats.categories}+</p>
              <p className="text-sm text-gray-500">Kategori Layanan</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section - Tokopedia Style (Centered) */}
      <section className="py-8 bg-white">
        <div className="container-app">
          <div className="text-center mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">
              Kategori Utama
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-2 gap-3 md:gap-4 max-w-2xl mx-auto">
            {FEATURED_CATEGORIES.map((category) => (
              <Link
                key={category.name}
                href={`/search?type=${category.type}`}
                className="group bg-white p-6 rounded-2xl border border-gray-100 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 text-center"
              >
                <div className="w-14 h-14 mx-auto mb-4 bg-primary rounded-full flex items-center justify-center group-hover:bg-primary-dark transition-colors shadow-md">
                  {category.icon === 'briefcase' && (
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  )}
                  {category.icon === 'shopping-bag' && (
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  )}
                  {category.icon === 'map' && (
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                  )}
                  {category.icon === 'building' && (
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  )}
                  {category.icon === 'megaphone' && (
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                    </svg>
                  )}
                </div>
                <h3 className="font-semibold text-gray-800">{category.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Services Section */}
      {services.length > 0 && (
        <section className="py-14 bg-white">
          <div className="container-app">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                  Jasa Terpopuler
                </h2>
                <p className="text-gray-500">
                  Temukan jasa profesional terpercaya
                </p>
              </div>
              <Link href="/search?type=JASA">
                <Button variant="ghost" className="text-primary">Lihat Semua →</Button>
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
              {services.slice(0, 4).map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products Section */}
      {products.length > 0 && (
        <section className="py-14 bg-gray-50">
          <div className="container-app">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                  Produk Lokal Unggulan
                </h2>
                <p className="text-gray-500">
                  Beli produk lokal berkualitas dari Sabu Raijua
                </p>
              </div>
              <Link href="/search?type=PRODUK">
                <Button variant="ghost" className="text-primary">Lihat Semua →</Button>
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
              {products.slice(0, 4).map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Listings Grid */}
      {listings.length > 0 && (
        <section className="py-14 bg-white">
          <div className="container-app">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                  Semua Listing
                </h2>
                <p className="text-gray-500">
                  Jelajahi semua layanan dan produk
                </p>
              </div>
              <Link href="/search?q=">
                <Button variant="ghost" className="text-primary">Lihat Semua →</Button>
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Trust Section - Wajib */}
      <section className="py-14 bg-white">
        <div className="container-app">
          <div className="bg-gradient-to-br from-primary-soft to-white rounded-2xl p-8 md:p-12">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">
                Mengapa Memilih SABUConnect?
              </h2>
              <p className="text-gray-500 max-w-xl mx-auto">
                Platform terpercaya untuk warga Sabu Raijua
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-14 h-14 mx-auto mb-4 bg-primary rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Provider Terverifikasi</h3>
                <p className="text-sm text-gray-500">Setiap provider telah diverifikasi keabsahannya</p>
              </div>

              <div className="text-center">
                <div className="w-14 h-14 mx-auto mb-4 bg-primary rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Transaksi Aman</h3>
                <p className="text-sm text-gray-500">Sistem pembayaran yang aman dan terpercaya</p>
              </div>

              <div className="text-center">
                <div className="w-14 h-14 mx-auto mb-4 bg-primary rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Dukungan Admin Lokal</h3>
                <p className="text-sm text-gray-500">Tim support yang siap membantu Anda</p>
              </div>

              <div className="text-center">
                <div className="w-14 h-14 mx-auto mb-4 bg-primary rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Layanan Terlengkap</h3>
                <p className="text-sm text-gray-500">Kumpulkan berbagai layanan dalam satu platform</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-14 bg-primary">
        <div className="container-app text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Punya Usaha atau Jasa?
          </h2>
          <p className="text-white/85 max-w-2xl mx-auto mb-8">
            Daftarkan usaha atau jasa Anda di SABUConnect dan jangkau lebih banyak 
            pelanggan di Kabupaten Sabu Raijua
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="bg-amber-500 text-white hover:bg-amber-600 font-semibold shadow-lg px-8">
                Daftar sebagai Provider
              </Button>
            </Link>
            <Link href="/search?q=">
              <Button size="lg" className="bg-green-700 text-white hover:bg-green-800 font-semibold shadow-lg px-8">
                Pelajari Lebih Lanjut
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <div className="hidden md:block">
        <Footer />
      </div>
    </div>
    </MobileLayout>
  )
}
