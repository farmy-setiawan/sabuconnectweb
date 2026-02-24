import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import prisma from '@/lib/prisma/prisma'
import { formatDate } from '@/lib/utils'

interface SearchParams {
  search?: string
  role?: string
}

async function getAllUsers(search?: string, role?: string) {
  try {
    const where: Record<string, unknown> = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (role) {
      where.role = role
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isVerified: true,
        createdAt: true,
        _count: {
          select: {
            listings: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return users
  } catch (error) {
    console.error('Error fetching users:', error)
    return []
  }
}

async function getStats() {
  try {
    const [total, admins, providers, users, unverified] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'ADMIN' } }),
      prisma.user.count({ where: { role: 'PROVIDER' } }),
      prisma.user.count({ where: { role: 'USER' } }),
      prisma.user.count({ where: { isVerified: false } }),
    ])

    return { total, admins, providers, users, unverified }
  } catch (error) {
    console.error('Error fetching stats:', error)
    return { total: 0, admins: 0, providers: 0, users: 0, unverified: 0 }
  }
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const session = await auth()

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/')
  }

  const params = await searchParams
  const search = params.search
  const roleFilter = params.role

  const [users, stats] = await Promise.all([
    getAllUsers(search, roleFilter),
    getStats(),
  ])

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-100 text-purple-800'
      case 'PROVIDER':
        return 'bg-primary/10 text-primary'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'Admin'
      case 'PROVIDER':
        return 'Provider'
      default:
        return 'User'
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        <div className="container-app py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-text-primary">Kelola Users</h1>
            <p className="text-text-secondary">Kelola semua pengguna platform</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-primary">{stats.total}</p>
                <p className="text-sm text-text-secondary">Total</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-purple-600">{stats.admins}</p>
                <p className="text-sm text-text-secondary">Admin</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-primary">{stats.providers}</p>
                <p className="text-sm text-text-secondary">Provider</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-gray-600">{stats.users}</p>
                <p className="text-sm text-text-secondary">User</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-yellow-600">{stats.unverified}</p>
                <p className="text-sm text-text-secondary">Belum Verifikasi</p>
              </CardContent>
            </Card>
          </div>

          {/* Users Table */}
          {users.length > 0 ? (
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-border">
                    <tr>
                      <th className="text-left py-3 px-4 font-medium text-text-secondary text-sm">User</th>
                      <th className="text-left py-3 px-4 font-medium text-text-secondary text-sm">Role</th>
                      <th className="text-left py-3 px-4 font-medium text-text-secondary text-sm">Listing</th>
                      <th className="text-left py-3 px-4 font-medium text-text-secondary text-sm">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-text-secondary text-sm">Bergabung</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b border-border hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                              <span className="text-primary font-medium">
                                {user.name?.charAt(0).toUpperCase() || 'U'}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium">{user.name || '-'}</p>
                              <p className="text-xs text-text-secondary">{user.email}</p>
                              {user.phone && (
                                <p className="text-xs text-text-secondary">{user.phone}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadge(user.role)}`}>
                            {getRoleLabel(user.role)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {user._count.listings} listing
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.isVerified
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {user.isVerified ? 'Terverifikasi' : 'Menunggu'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-text-secondary">
                          {formatDate(user.createdAt.toISOString())}
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <h3 className="text-lg font-semibold mb-2">Tidak Ada User</h3>
                <p className="text-text-secondary">Belum ada user dalam sistem</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
