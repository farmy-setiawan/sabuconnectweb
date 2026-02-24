'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { formatPrice, formatDate, generateWhatsAppLink } from '@/lib/utils'

interface Transaction {
  id: string
  listing: {
    title: string
    slug: string
  }
  customer: {
    name: string
    phone: string
  }
  provider: {
    name: string
    phone: string
  }
  amount: number
  paymentMethod: string
  status: string
  notes: string
  createdAt: string
  updatedAt: string
}

export default function ProviderTransactionsPage() {
  const { data: session, status } = useSession()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('')
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null)

  useEffect(() => {
    if (session) {
      fetchTransactions()
    }
  }, [session])

  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/transactions')
      if (response.ok) {
        const data = await response.json()
        setTransactions(data.transactions || [])
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredTransactions = filterStatus
    ? transactions.filter(t => t.status === filterStatus)
    : transactions

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800'
      case 'IN_PROGRESS':
        return 'bg-purple-100 text-purple-800'
      case 'COMPLETED':
        return 'bg-green-100 text-green-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Menunggu'
      case 'CONFIRMED':
        return 'Dikonfirmasi'
      case 'IN_PROGRESS':
        return 'Diproses'
      case 'COMPLETED':
        return 'Selesai'
      case 'CANCELLED':
        return 'Dibatalkan'
      default:
        return status
    }
  }

  const handleContactCustomer = (phone: string) => {
    const message = 'Halo, saya dari SABUConnect. Saya ingin mengkonfirmasi transaksi Anda.'
    const link = generateWhatsAppLink(phone, message)
    window.open(link, '_blank')
  }

  const handleUpdateStatus = async (transactionId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/transactions/${transactionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        fetchTransactions()
        setSelectedTx(null)
      }
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!session || (session.user.role !== 'PROVIDER' && session.user.role !== 'ADMIN')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-text-primary mb-4">Akses Ditolak</h2>
          <p className="text-text-secondary mb-4">Halaman ini hanya untuk provider</p>
          <Link href="/login">
            <Button>Masuk</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        <div className="container-app py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-text-primary">Transaksi</h1>
            <p className="text-text-secondary">Kelola transaksi dengan pelanggan</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-primary">{transactions.length}</p>
                <p className="text-sm text-text-secondary">Total</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-yellow-600">
                  {transactions.filter(t => t.status === 'PENDING').length}
                </p>
                <p className="text-sm text-text-secondary">Menunggu</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {transactions.filter(t => t.status === 'IN_PROGRESS').length}
                </p>
                <p className="text-sm text-text-secondary">Diproses</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-purple-600">
                  {transactions.filter(t => t.status === 'CONFIRMED').length}
                </p>
                <p className="text-sm text-text-secondary">Dikonfirmasi</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-green-600">
                  {transactions.filter(t => t.status === 'COMPLETED').length}
                </p>
                <p className="text-sm text-text-secondary">Selesai</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-6">
            <Button
              variant={filterStatus === '' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('')}
            >
              Semua
            </Button>
            <Button
              variant={filterStatus === 'PENDING' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('PENDING')}
            >
              Menunggu
            </Button>
            <Button
              variant={filterStatus === 'CONFIRMED' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('CONFIRMED')}
            >
              Dikonfirmasi
            </Button>
            <Button
              variant={filterStatus === 'IN_PROGRESS' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('IN_PROGRESS')}
            >
              Diproses
            </Button>
            <Button
              variant={filterStatus === 'COMPLETED' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('COMPLETED')}
            >
              Selesai
            </Button>
            <Button
              variant={filterStatus === 'CANCELLED' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('CANCELLED')}
            >
              Dibatalkan
            </Button>
          </div>

          {/* Transactions Table */}
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : filteredTransactions.length > 0 ? (
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-text-secondary">Listing</th>
                      <th className="text-left py-3 px-4 font-medium text-text-secondary">Pelanggan</th>
                      <th className="text-left py-3 px-4 font-medium text-text-secondary">Metode</th>
                      <th className="text-left py-3 px-4 font-medium text-text-secondary">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-text-secondary">Tanggal</th>
                      <th className="text-left py-3 px-4 font-medium text-text-secondary">Total</th>
                      <th className="text-left py-3 px-4 font-medium text-text-secondary">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((tx) => (
                      <tr key={tx.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <p className="font-medium">{tx.listing?.title || '-'}</p>
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-medium">{tx.customer?.name || '-'}</p>
                          <p className="text-xs text-text-secondary">{tx.customer?.phone || '-'}</p>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm">
                            {tx.paymentMethod === 'COD' ? 'COD' : 'Transfer'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(tx.status)}`}>
                            {getStatusLabel(tx.status)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-text-secondary">
                          {tx.createdAt ? formatDate(tx.createdAt) : '-'}
                        </td>
                        <td className="py-3 px-4 font-medium">
                          Rp {formatPrice(tx.amount)}
                        </td>
                        <td className="py-3 px-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedTx(tx)}
                          >
                            Detail
                          </Button>
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h3 className="text-lg font-semibold mb-2">Belum Ada Transaksi</h3>
                <p className="text-text-secondary">Transaksi akan muncul setelah pelanggan memesan</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Transaction Detail Modal */}
      {selectedTx && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Detail Transaksi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-text-secondary">Listing</p>
                <p className="font-medium">{selectedTx.listing?.title}</p>
              </div>
              <div>
                <p className="text-sm text-text-secondary">Pelanggan</p>
                <p className="font-medium">{selectedTx.customer?.name}</p>
                <p className="text-sm">{selectedTx.customer?.phone}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-text-secondary">Total</p>
                  <p className="font-medium">Rp {formatPrice(selectedTx.amount)}</p>
                </div>
                <div>
                  <p className="text-sm text-text-secondary">Metode Pembayaran</p>
                  <p className="font-medium">{selectedTx.paymentMethod === 'COD' ? 'COD' : 'Transfer'}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-text-secondary">Status</p>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedTx.status)}`}>
                  {getStatusLabel(selectedTx.status)}
                </span>
              </div>
              {selectedTx.notes && (
                <div>
                  <p className="text-sm text-text-secondary">Catatan</p>
                  <p className="text-sm">{selectedTx.notes}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-text-secondary">Tanggal</p>
                <p className="text-sm">{selectedTx.createdAt ? formatDate(selectedTx.createdAt) : '-'}</p>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 pt-4 border-t">
                {selectedTx.customer?.phone && (
                  <Button
                    variant="outline"
                    onClick={() => handleContactCustomer(selectedTx.customer.phone)}
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    Hubungi via WhatsApp
                  </Button>
                )}

                {/* Status Update Buttons */}
                {selectedTx.status === 'PENDING' && (
                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      onClick={() => handleUpdateStatus(selectedTx.id, 'CONFIRMED')}
                    >
                      Konfirmasi
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleUpdateStatus(selectedTx.id, 'CANCELLED')}
                    >
                      Tolak
                    </Button>
                  </div>
                )}
                {selectedTx.status === 'CONFIRMED' && (
                  <Button
                    onClick={() => handleUpdateStatus(selectedTx.id, 'IN_PROGRESS')}
                  >
                    Mulai Proses
                  </Button>
                )}
                {selectedTx.status === 'IN_PROGRESS' && (
                  <Button
                    onClick={() => handleUpdateStatus(selectedTx.id, 'COMPLETED')}
                  >
                    Tandai Selesai
                  </Button>
                )}
                <Button
                  variant="ghost"
                  onClick={() => setSelectedTx(null)}
                >
                  Tutup
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Footer />
    </div>
  )
}
