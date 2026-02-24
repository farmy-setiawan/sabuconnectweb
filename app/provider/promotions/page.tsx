import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { formatPrice, formatDate } from '@/lib/utils'
import prisma from '@/lib/prisma/prisma'
import { PromotionModal } from './PromotionModal'

async function getProviderListings(userId: string) {
  try {
    const listings = await prisma.listing.findMany({
      where: { userId },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
    return listings
  } catch (error) {
    console.error('Error fetching listings:', error)
    return []
  }
}

function getStatusBadge(status: string | undefined) {
  if (!status || status === 'NONE') {
    return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">Tidak Aktif</span>
  }
  switch (status) {
    case 'ACTIVE':
      return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Aktif</span>
    case 'PENDING_APPROVAL':
      return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Menunggu</span>
    case 'WAITING_PAYMENT':
      return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">Menunggu Bayar</span>
    case 'PAYMENT_UPLOADED':
      return <span className="px-2 py-1 text-xs rounded-full bg-indigo-100 text-indigo-800">Verifikasi</span>
    case 'REJECTED':
      return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Ditolak</span>
    case 'EXPIRED':
      return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">Expired</span>
    case 'STOPPED':
      return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">Dijeda</span>
    default:
      return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">{status}</span>
  }
}

export default async function PromotionsPage() {
  const session = await auth()

  if (!session || (session.user.role !== 'PROVIDER' && session.user.role !== 'ADMIN')) {
    redirect('/login')
  }

  const listings = await getProviderListings(session.user.id)

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1">
        <div className="max-w-6xl mx-auto py-8 px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Promosi Listing</h1>
            <p className="text-gray-600">Kelola promosi listing Anda</p>
          </div>

          {/* Info */}
          <Card className="mb-6" style={{ backgroundColor: '#e6f6ea', borderColor: '#03a21d' }}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#03a21d' }}>
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium" style={{ color: '#03a21d' }}>Promosi Listing - Rp1.000/hari</p>
                  <p className="text-sm text-gray-600">Promosi akan aktif setelah admin menyetujui</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Table */}
          <Card>
            <CardHeader>
              <CardTitle>Daftar Listing</CardTitle>
              <CardDescription>Klik tombol "Promosikan" untuk mengajukan promosi</CardDescription>
            </CardHeader>
            <CardContent>
              {listings.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Nama Listing</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Kategori</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Harga</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {listings.map((listing) => {
                        const status = (listing as any).promotionStatus || 'NONE'
                        const isActive = status === 'ACTIVE'
                        const isPending = status === 'PENDING_APPROVAL'
                        const needsPayment = status === 'WAITING_PAYMENT'
                        const needsVerify = status === 'PAYMENT_UPLOADED'
                        
                        return (
                          <tr key={listing.id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                  {listing.images && listing.images.length > 0 ? (
                                    <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                      </svg>
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <p className="font-medium">{listing.title}</p>
                                  <p className="text-xs text-gray-500">{listing.location}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-gray-600">{listing.category?.name}</td>
                            <td className="py-3 px-4 font-medium" style={{ color: '#03a21d' }}>
                              {Number(listing.price) === 0 ? 'Gratis' : `Rp ${formatPrice(listing.price.toString())}`}
                            </td>
                            <td className="py-3 px-4">{getStatusBadge(status)}</td>
                            <td className="py-3 px-4">
                              {isActive ? (
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-green-600 font-medium">Aktif</span>
                                  <PromotionModal 
                                    listing={listing} 
                                    action="stop" 
                                  />
                                </div>
                              ) : needsPayment ? (
                                <PromotionModal 
                                  listing={listing} 
                                  action="pay" 
                                />
                              ) : needsVerify ? (
                                <span className="text-xs text-indigo-600">Menunggu Verifikasi</span>
                              ) : isPending ? (
                                <span className="text-xs text-yellow-600">Menunggu Approval</span>
                              ) : (
                                <PromotionModal 
                                  listing={listing} 
                                  action="promote" 
                                />
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <p className="text-gray-600 mb-4">Belum ada listing</p>
                  <Link href="/provider/listings/new">
                    <Button style={{ backgroundColor: '#03a21d' }}>Buat Listing</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
