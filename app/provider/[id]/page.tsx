import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma/prisma'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { ListingCard } from '@/components/listings/ListingCard'
import { Badge } from '@/components/ui/Badge'
import { APP_NAME } from '@/lib/constants'

interface PageProps {
  params: { id: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const provider = await prisma.user.findUnique({
    where: { id: params.id },
    select: { name: true }
  })
  
  if (!provider) {
    return {
      title: 'Profil Tidak Ditemukan',
    }
  }
  
  return {
    title: `${provider.name} - ${APP_NAME}`,
    description: `Lihat profil dan semua listing dari ${provider.name} di ${APP_NAME}`,
  }
}

export const dynamic = 'force-dynamic'

async function getProvider(id: string) {
  const provider = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      avatar: true,
      phone: true,
      isVerified: true,
      createdAt: true,
      _count: {
        select: {
          listings: {
            where: { status: 'ACTIVE' }
          }
        }
      }
    }
  })
  return provider
}

async function getProviderListings(providerId: string) {
  const listings = await prisma.listing.findMany({
    where: {
      userId: providerId,
      status: 'ACTIVE',
    },
    orderBy: [
      { isFeatured: 'desc' },
      { promotionPriority: 'desc' },
      { views: 'desc' },
      { createdAt: 'desc' },
    ],
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
      promotionStatus: true,
      promotionPriority: true,
      createdAt: true,
      updatedAt: true,
      user: {
        select: {
          id: true,
          name: true,
          avatar: true,
          isVerified: true,
        },
      },
      category: {
        select: {
          id: true,
          name: true,
          type: true,
        },
      },
      promotion: {
        select: {
          id: true,
          status: true,
          createdAt: true,
        },
      },
    },
  })
  return listings
}

export default async function ProviderProfilePage({ params }: PageProps) {
  const provider = await getProvider(params.id)
  
  if (!provider) {
    notFound()
  }
  
  const listings = await getProviderListings(params.id)
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1 container-app py-6 md:py-8">
        {/* Provider Profile Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6 mb-6 md:mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
            {/* Avatar */}
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
              {provider.avatar ? (
                <img 
                  src={provider.avatar} 
                  alt={provider.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary text-white text-2xl md:text-3xl font-bold">
                  {provider.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            
            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl md:text-2xl font-bold text-gray-900">{provider.name}</h1>
                {provider.isVerified && (
                  <Badge className="bg-blue-500 text-white text-xs">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Terverifikasi
                  </Badge>
                )}
              </div>
              
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  {provider._count.listings} listing
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Bergabung {new Date(provider.createdAt).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Listings Section */}
        <div>
          <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">
            Semua Listing dari {provider.name}
          </h2>
          
          {listings.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing as any} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
              <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-gray-500">Belum ada listing dari penyedia ini</p>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  )
}
