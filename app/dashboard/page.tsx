import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

export default async function DashboardPage() {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  // Redirect to role-based dashboard
  if (session.user.role === 'ADMIN') {
    redirect('/admin')
  } else if (session.user.role === 'PROVIDER') {
    redirect('/provider')
  }

  const userRole = session.user.role

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-gray-50">
        <div className="container-app py-8">
          {/* Welcome */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-800">
              Halo, {session.user.name}! 👋
            </h1>
            <p className="text-gray-500 mt-1">
              Selamat datang di SABUConnect
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/search?q=">
              <Card hover className="h-full border-0 shadow-sm">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Jelajahi Marketplace</p>
                    <p className="text-sm text-gray-500">Cari jasa & produk lokal</p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/profile">
              <Card hover className="h-full border-0 shadow-sm">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Profil Saya</p>
                    <p className="text-sm text-gray-500">Kelola informasi akun</p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/register">
              <Card hover className="h-full border-0 shadow-sm">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Jadi Provider</p>
                    <p className="text-sm text-gray-500">Daftarkan usaha Anda</p>
                  </div>
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
