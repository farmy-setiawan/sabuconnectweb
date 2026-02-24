import { Suspense } from 'react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { BottomNav } from '@/components/layout/BottomNav'
import { ListingCard } from '@/components/listings/ListingCard'
import { SearchFilters } from './SearchFilters'
import prisma from '@/lib/prisma/prisma'
import { Listing } from '@/types'

interface SearchParams {
  q?: string
  categoryId?: string
  type?: string
  location?: string
  minPrice?: string
  maxPrice?: string
  sortBy?: string
  page?: string
}

async function getListings(params: SearchParams) {
  const { q, categoryId, type, location, minPrice, maxPrice, sortBy, page } = params

  const where: Record<string, unknown> = {
    status: 'ACTIVE',
  }

  if (q) {
    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
    ]
  }

  if (categoryId) {
    where.categoryId = categoryId
  }

  if (type) {
    where.category = { type }
  }

  if (location) {
    where.location = { contains: location, mode: 'insensitive' }
  }

  if (minPrice || maxPrice) {
    where.price = {}
    if (minPrice) (where.price as Record<string, number>).gte = parseFloat(minPrice)
    if (maxPrice) (where.price as Record<string, number>).lte = parseFloat(maxPrice)
  }

  let orderBy: Record<string, string> = {}
  switch (sortBy) {
    case 'price_asc':
      orderBy = { price: 'asc' }
      break
    case 'price_desc':
      orderBy = { price: 'desc' }
      break
    case 'popular':
      orderBy = { views: 'desc' }
      break
    default:
      orderBy = { createdAt: 'desc' }
  }

  const pageNum = parseInt(page || '1')
  const limit = 12
  const skip = (pageNum - 1) * limit

  const [listings, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        category: true,
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    }),
    prisma.listing.count({ where }),
  ])

  return {
    listings: listings as unknown as Listing[],
    pagination: {
      page: pageNum,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}

async function getCategories() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
    })
    return categories
  } catch {
    return []
  }
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const [{ listings, pagination }, categories] = await Promise.all([
    getListings(params),
    getCategories(),
  ])

  return (
    <div className="min-h-screen flex flex-col pb-16 md:pb-0">
      <Header />

      <main className="flex-1 bg-background pb-4 md:pb-0">
        <div className="container-app py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters */}
            <aside className="w-full lg:w-64 flex-shrink-0">
              <div className="bg-white rounded-lg border border-border p-4 sticky top-24">
                <h2 className="font-semibold text-lg mb-4">Filter</h2>
                <SearchFilters categories={categories} />
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1">
              {/* Results Header */}
              <div className="flex justify-between items-center mb-6">
                <p className="text-text-secondary">
                  Ditemukan <span className="font-semibold text-text-primary">{pagination.total}</span> listing
                </p>
              </div>

              {/* Listings Grid */}
              {listings.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {listings.map((listing) => (
                      <ListingCard key={listing.id} listing={listing} />
                    ))}
                  </div>

                  {/* Pagination */}
                  {pagination.totalPages > 1 && (
                    <div className="flex justify-center gap-2 mt-8">
                      {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                        <a
                          key={page}
                          href={`?${new URLSearchParams({
                            ...params,
                            page: page.toString(),
                          })}`}
                          className={`px-4 py-2 rounded-md ${
                            page === pagination.page
                              ? 'bg-primary text-white'
                              : 'bg-white border border-border text-text-secondary hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </a>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-16 bg-white rounded-lg border border-border">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-text-primary mb-2">
                    Tidak ada hasil
                  </h3>
                  <p className="text-text-secondary">
                    Coba ubah filter atau kata kunci pencarian Anda
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <div className="hidden md:block">
        <Footer />
      </div>
      <BottomNav />
    </div>
  )
}
