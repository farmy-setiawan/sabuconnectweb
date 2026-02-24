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
      
      <main className="container-app py-8">
        {/* Provider Profile Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Avatar */}
            <div className="relative">
              {provider.avatar ? (
                <Image
                  src={provider.avatar}
                  alt={provider.name}
                  width={120}
                  height={120}
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="w-30 h-30 bg-gradient-to-br from-primary to-green-600 rounded-full flex items-center justify-center text-white text-4xl font-bold">
                  {provider.name.charAt(0).toUpperCase()}
                </div>
              )}
              {provider.isVerified && (
                <div className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-1.5">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            
            {/* Info */}
            <div className="text-center md:text-left flex-1">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">{provider.name}</h1>
                {provider.isVerified && (
                  <Badge className="bg-blue-500 text-white">Terverifikasi</Badge>
                )}
              </div>
              
              <div className="flex items-center justify-center md:justify-start gap-4 text-gray-600 mb-4">
                {provider.phone && (
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {provider.phone}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Berjoin sejak {new Date(provider.createdAt).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                </span>
              </div>
              
              <div className="flex items-center justify-center md:justify-start gap-2">
                <div className="bg-primary/10 text-primary px-4 py-2 rounded-lg font-semibold">
                  {provider._count.listings} Listing Aktif
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Listings */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-6">Listing dari {provider.name}</h2>
          
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
