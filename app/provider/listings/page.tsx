import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import prisma from '@/lib/prisma/prisma'
import { formatPrice, formatDate } from '@/lib/utils'
import { ListingActions } from '@/components/provider/ListingActions'

interface SearchParams {
  status?: string
}

async function getProviderListings(userId: string, status?: string) {
  try {
    const where: Record<string, unknown> = { userId }
    
    if (status) {
      where.status = status
    }

    const listings = await prisma.listing.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return listings
  } catch (error) {
    console.error('Error fetching listings:', error)
    return []
  }
}

async function getProviderStats(userId: string) {
  try {
    const [total, active, pending, viewsResult] = await Promise.all([
      prisma.listing.count({ where: { userId } }),
      prisma.listing.count({ where: { userId, status: 'ACTIVE' } }),
      prisma.listing.count({ where: { userId, status: 'PENDING' } }),
      prisma.listing.aggregate({
        where: { userId },
        _sum: { views: true },
      }),
    ])

    return {
      total,
      active,
      pending,
      totalViews: viewsResult._sum.views || 0,
    }
  } catch (error) {
    console.error('Error fetching stats:', error)
    return { total: 0, active: 0, pending: 0, totalViews: 0 }
  }
}

export default async function ProviderListingsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const session = await auth()

  if (!session || (session.user.role !== 'PROVIDER' && session.user.role !== 'ADMIN')) {
    redirect('/login')
  }

  const params = await searchParams
  const statusFilter = params.status

  const [listings, stats] = await Promise.all([
    getProviderListings(session.user.id, statusFilter),
    getProviderStats(session.user.id),
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800'
      case 'REJECTED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Aktif'
      case 'PENDING':
        return 'Menunggu'
      case 'INACTIVE':
        return 'Nonaktif'
      case 'REJECTED':
        return 'Ditolak'
      default:
        return status
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        <div className="container-app py-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-text-primary">Kelola Listing</h1>
              <p className="text-text-secondary">Kelola jasa dan produk Anda</p>
            </div>
            <Link href="/provider/listings/new">
              <Button>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Tambah Listing
              </Button>
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-secondary">Total Listing</p>
                    <p className="text-2xl font-bold text-primary">{stats.total}</p>
                  </div>
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-secondary">Aktif</p>
                    <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                  </div>
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-secondary">Menunggu</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                  </div>
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-secondary">Total Views</p>
                    <p className="text-2xl font-bold text-primary">{stats.totalViews}</p>
                  </div>
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filter */}
          <div className="flex gap-2 mb-6">
            <Link href="/provider/listings">
              <Button variant={!statusFilter ? 'primary' : 'outline'} size="sm">
                Semua
              </Button>
            </Link>
            <Link href="/provider/listings?status=ACTIVE">
              <Button variant={statusFilter === 'ACTIVE' ? 'primary' : 'outline'} size="sm">
                Aktif
              </Button>
            </Link>
            <Link href="/provider/listings?status=PENDING">
              <Button variant={statusFilter === 'PENDING' ? 'primary' : 'outline'} size="sm">
                Menunggu
              </Button>
            </Link>
            <Link href="/provider/listings?status=INACTIVE">
              <Button variant={statusFilter === 'INACTIVE' ? 'primary' : 'outline'} size="sm">
                Nonaktif
              </Button>
            </Link>
          </div>

          {/* Listings Table */}
          {listings.length > 0 ? (
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-text-secondary">Judul</th>
                      <th className="text-left py-3 px-4 font-medium text-text-secondary">Kategori</th>
                      <th className="text-left py-3 px-4 font-medium text-text-secondary">Harga</th>
                      <th className="text-left py-3 px-4 font-medium text-text-secondary">Lokasi</th>
                      <th className="text-left py-3 px-4 font-medium text-text-secondary">Views</th>
                      <th className="text-left py-3 px-4 font-medium text-text-secondary">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-text-secondary">Tanggal</th>
                      <th className="text-left py-3 px-4 font-medium text-text-secondary">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {listings.map((listing) => (
                      <tr key={listing.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium">{listing.title}</p>
                            <p className="text-xs text-text-secondary">{listing.slug}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm">
                            {listing.category?.name || '-'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-medium">
                            {listing.priceType === 'NEGOTIABLE' 
                              ? 'Nego' 
                              : listing.priceType === 'STARTING_FROM'
                              ? `Mulai ${formatPrice(listing.price)}`
                              : formatPrice(listing.price)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm">{listing.location}</td>
                        <td className="py-3 px-4 text-sm">{listing.views}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(listing.status)}`}>
                            {getStatusLabel(listing.status)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-text-secondary">
                          {formatDate(listing.createdAt.toISOString())}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Link href={`/provider/listings/${listing.id}/edit`}>
                              <Button variant="outline" size="sm">
                                Edit
                              </Button>
                            </Link>
                            <ListingActions listingId={listing.id} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <h3 className="text-lg font-semibold mb-2">Belum Ada Listing</h3>
                <p className="text-text-secondary mb-6">Mulai pasang jasa atau produk pertama Anda</p>
                <Link href="/provider/listings/new">
                  <Button>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Tambah Listing
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
