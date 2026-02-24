import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import prisma from '@/lib/prisma/prisma'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { ListingCard } from '@/components/listings/ListingCard'
import { Badge } from '@/components/ui/Badge'

interface ProviderProfilePageProps {
  params: Promise<{ id: string }>
}

// ISR: revalidate every 60 seconds
export const revalidate = 60

async function getProvider(id: string) {
  try {
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
  } catch (error) {
    console.error('Error fetching provider:', error)
    return null
  }
}

async function getProviderListings(providerId: string) {
  try {
    const listings = await prisma.listing.findMany({
      where: {
        userId: providerId,
        status: 'ACTIVE'
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 12,
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
        promotionPriority: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            isVerified: true
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            type: true
          }
        },
        promotion: {
          select: {
            id: true,
            status: true
          }
        }
      }
    })
    return listings
  } catch (error) {
    console.error('Error fetching provider listings:', error)
    return []
  }
}

export default async function ProviderProfilePage({ params }: ProviderProfilePageProps) {
  const { id } = await params
  
  const provider = await getProvider(id)
  
  if (!provider) {
    notFound()
  }
  
  const listings = await getProviderListings(id)
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container-app py-6 md:py-10">
        {/* Provider Profile Header */}
        <div className="bg-white rounded-2xl shadow-sm p-4 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-8">
            {/* Info */}
            <div className="text-center md:text-left flex-1">
              <div className="flex flex-col md:flex-row items-center md:items-center gap-2 mb-4">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{provider.name}</h1>
                {provider.isVerified && (
                  <Badge className="bg-green-500 text-white font-medium text-xs">Terverifikasi</Badge>
                )}
              </div>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 md:gap-4 text-gray-500 text-sm mb-4">
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Berjoin {new Date(provider.createdAt).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}</span>
                </span>
              </div>
              
              <div className="flex items-center justify-center md:justify-start">
                <div className="bg-green-50 text-green-700 px-5 py-2.5 rounded-xl font-semibold text-sm">
                  {provider._count.listings} Listing Aktif
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Listings */}
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">Listing dari {provider.name}</h2>
          
          {listings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing as any} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl">
              <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-gray-500">Belum ada listing aktif</p>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  )
}
