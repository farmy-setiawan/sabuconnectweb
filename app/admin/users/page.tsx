import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import prisma from '@/lib/prisma/prisma'
import { UsersClient } from './UsersClient'

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
      take: 50,
    })

    return users.map(user => ({
      ...user,
      createdAt: user.createdAt.toISOString(),
    }))
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

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1">
        <div className="container-app py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Kelola Users</h1>
            <p className="text-gray-500">Kelola semua pengguna platform</p>
          </div>

          <UsersClient initialUsers={users} stats={stats} />
        </div>
      </main>

      <Footer />
    </div>
  )
}
