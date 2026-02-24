'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { BottomNav } from '@/components/layout/BottomNav'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

// Sample transactions data
const sampleTransactions = [
  {
    id: '1',
    listing: { title: 'Jasa Service AC Profesional', slug: 'jasa-service-ac' },
    customer: { name: 'Budi Santoso' },
    provider: { name: 'Toko Sabu' },
    amount: 150000,
    status: 'COMPLETED' as const,
    paymentMethod: 'COD' as const,
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    listing: { title: 'Kelapa Segar 1000 Butir', slug: 'kelapa-segar' },
    customer: { name: 'Ahmad Wijaya' },
    provider: { name: 'Toko Sabu' },
    amount: 15000000,
    status: 'IN_PROGRESS' as const,
    paymentMethod: 'TRANSFER' as const,
    createdAt: '2024-01-18',
  },
  {
    id: '3',
    listing: { title: 'Jasa Pembuatan Furniture', slug: 'jasa-furniture' },
    customer: { name: 'Saya' },
    provider: { name: 'Tukang Kayu Maju' },
    amount: 500000,
    status: 'PENDING' as const,
    paymentMethod: null,
    createdAt: '2024-01-20',
  },
]

export default function TransactionsPage() {
  const { data: session, status } = useSession()
  const [transactions] = useState(sampleTransactions)

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-text-primary mb-4">Login Required</h2>
          <p className="text-text-secondary mb-4">Silakan login untuk melihat transaksi</p>
          <Link href="/login">
            <Button>Masuk</Button>
          </Link>
        </div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800'
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'ACCEPTED':
        return 'bg-primary/10 text-primary'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'Selesai'
      case 'IN_PROGRESS': return 'Sedang Dikerjakan'
      case 'PENDING': return 'Menunggu'
      case 'ACCEPTED': return 'Diterima'
      case 'CANCELLED': return 'Dibatalkan'
      default: return status
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        <div className="container-app py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-text-primary">Transaksi Saya</h1>
            <p className="text-text-secondary">Kelola transaksi Anda</p>
          </div>

          {/* Transactions List */}
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <Card key={transaction.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    {/* Listing Info */}
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <Link href={`/listing/${transaction.listing.slug}`} className="font-medium text-text-primary hover:text-primary">
                            {transaction.listing.title}
                          </Link>
                          <p className="text-sm text-text-secondary mt-1">
                            {session.user.role === 'PROVIDER' 
                              ? `Pelanggan: ${transaction.customer.name}`
                              : `Provider: ${transaction.provider.name}`}
                          </p>
                          <p className="text-xs text-text-secondary">
                            {new Date(transaction.createdAt).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Status & Amount */}
                    <div className="flex flex-col items-end gap-2">
                      <span className={`inline-flex px-3 py-1 text-sm rounded-full ${getStatusColor(transaction.status)}`}>
                        {getStatusLabel(transaction.status)}
                      </span>
                      <p className="text-xl font-bold text-primary">
                        Rp {transaction.amount.toLocaleString('id-ID')}
                      </p>
                      {transaction.paymentMethod && (
                        <span className="text-xs text-text-secondary">
                          {transaction.paymentMethod === 'COD' ? 'Bayar di Tempat' : 'Transfer Bank'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  {transaction.status === 'PENDING' && session.user.role === 'USER' && (
                    <div className="mt-4 pt-4 border-t border-border flex gap-2">
                      <Button variant="outline" size="sm" className="text-red-500 border-red-200 hover:bg-red-50">
                        Batalkan
                      </Button>
                      <a
                        href={`https://wa.me/6281234567890?text=Halo, saya ingin konfirmasi transaksi ${transaction.listing.title}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="secondary" size="sm">
                          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                          </svg>
                          Hubungi via WhatsApp
                        </Button>
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {transactions.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-text-primary mb-2">Belum ada transaksi</h3>
              <p className="text-text-secondary mb-6">Mulai jelajahi listing dan buat transaksi</p>
              <Link href="/search?q=">
                <Button>Jelajahi Listing</Button>
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
      <BottomNav />
    </div>
  )
}
