import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Card, CardContent } from '@/components/ui/Card'
import prisma from '@/lib/prisma/prisma'

async function getProviderStats(userId: string) {
  try {
    const [
      totalListings,
      activeListings,
      pendingListings,
    ] = await Promise.all([
      prisma.listing.count({
        where: { userId },
      }),
      prisma.listing.count({
        where: { userId, status: 'ACTIVE' },
      }),
      prisma.listing.count({
        where: { userId, status: 'PENDING' },
      }),
    ])

    return {
      totalListings,
      activeListings,
      pendingListings,
    }
  } catch (error) {
    console.error('Error fetching provider stats:', error)
    return {
      totalListings: 0,
      activeListings: 0,
      pendingListings: 0,
    }
  }
}

export default async function ProviderDashboardPage() {
  const session = await auth()

  if (!session || (session.user.role !== 'PROVIDER' && session.user.role !== 'ADMIN')) {
    redirect('/login')
  }

  const stats = await getProviderStats(session.user.id)
  const userRole = session.user.role

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1">
        <div className="container-app py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-800">
              Dashboard {userRole === 'ADMIN' ? 'Admin' : 'Penyedia'} 👋
            </h1>
            <p className="text-gray-500 mt-1">
              Kelola bisnis Anda di SABUConnect
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Listing</p>
                    <p className="text-3xl font-bold text-primary">{stats.totalListings}</p>
                  </div>
                  <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center">
                    <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Listing Aktif</p>
                    <p className="text-3xl font-bold text-green-600">{stats.activeListings}</p>
                  </div>
                  <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
                    <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Menunggu Verifikasi</p>
                    <p className="text-3xl font-bold text-amber-500">{stats.pendingListings}</p>
                  </div>
                  <div className="w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center">
                    <svg className="w-7 h-7 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Menu Utama */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Menu Utama</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/provider/listings/new">
                <Card hover className="h-full border-0 shadow-sm cursor-pointer">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center">
                      <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">Tambah Listing</p>
                      <p className="text-sm text-gray-500">Pasang jasa atau produk baru</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/provider/listings">
                <Card hover className="h-full border-0 shadow-sm cursor-pointer">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                      <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">Kelola Listing</p>
                      <p className="text-sm text-gray-500">Edit atau hapus listing</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/provider/promotions">
                <Card hover className="h-full border-0 shadow-sm cursor-pointer">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center">
                      <svg className="w-7 h-7 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">Promosi</p>
                      <p className="text-sm text-gray-500">Kelola iklan dan promosi</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>

          {/* Admin Menu */}
          {userRole === 'ADMIN' && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Menu Admin</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href="/admin/listings">
                  <Card hover className="h-full border-0 shadow-sm cursor-pointer">
                    <CardContent className="p-6 flex items-center gap-4">
                      <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center">
                        <svg className="w-7 h-7 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">Verifikasi Listing</p>
                        <p className="text-sm text-gray-500">Review listing baru</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/admin/users">
                  <Card hover className="h-full border-0 shadow-sm cursor-pointer">
                    <CardContent className="p-6 flex items-center gap-4">
                      <div className="w-14 h-14 bg-cyan-100 rounded-xl flex items-center justify-center">
                        <svg className="w-7 h-7 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">Kelola Pengguna</p>
                        <p className="text-sm text-gray-500">Kelola data pengguna</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/admin/advertisements">
                  <Card hover className="h-full border-0 shadow-sm cursor-pointer">
                    <CardContent className="p-6 flex items-center gap-4">
                      <div className="w-14 h-14 bg-pink-100 rounded-xl flex items-center justify-center">
                        <svg className="w-7 h-7 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">Kelola Iklan</p>
                        <p className="text-sm text-gray-500">Kelola iklan pengguna</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            </div>
          )}

          {/* Profile Link */}
          <div>
            <Link href="/provider/profile">
              <Card hover className="border-0 shadow-sm cursor-pointer">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center">
                    <svg className="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">Profil Provider</p>
                    <p className="text-sm text-gray-500">Kelola informasi bisnis Anda</p>
                  </div>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
