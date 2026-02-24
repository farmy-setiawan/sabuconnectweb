'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { formatPrice, formatDate } from '@/lib/utils'

interface Advertisement {
  id: string
  listingId: string
  listing?: {
    title: string
  }
  userId: string
  user?: {
    name: string
    email: string
    phone: string
  }
  startDate: string
  endDate: string
  totalPrice: number
  paymentMethod: string
  status: string
  createdAt: string
}

export default function AdminAdvertisementsPage() {
  const { data: session, status } = useSession()
  const [ads, setAds] = useState<Advertisement[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('')

  useEffect(() => {
    if (session && session.user.role === 'ADMIN') {
      fetchAds()
    }
  }, [session])

  const fetchAds = async () => {
    try {
      const response = await fetch('/api/advertisements')
      if (response.ok) {
        const data = await response.json()
        setAds(data.advertisements || data)
      }
    } catch (error) {
      console.error('Error fetching ads:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredAds = filterStatus
    ? ads.filter(a => a.status === filterStatus)
    : ads

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'EXPIRED':
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
      case 'EXPIRED':
        return 'Kedaluwarsa'
      case 'REJECTED':
        return 'Ditolak'
      default:
        return status
    }
  }

  const handleApprove = async (id: string) => {
    try {
      const response = await fetch(`/api/advertisements/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ACTIVE' }),
      })

      if (response.ok) {
        fetchAds()
      }
    } catch (error) {
      console.error('Error approving ad:', error)
    }
  }

  const handleReject = async (id: string) => {
    try {
      const response = await fetch(`/api/advertisements/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'REJECTED' }),
      })

      if (response.ok) {
        fetchAds()
      }
    } catch (error) {
      console.error('Error rejecting ad:', error)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!session || session.user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-text-primary mb-4">Akses Ditolak</h2>
          <p className="text-text-secondary mb-4">Halaman ini hanya untuk admin</p>
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
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-text-primary">Kelola Iklan</h1>
              <p className="text-text-secondary">Persetujuan dan moderasi iklan</p>
            </div>
            <Link href="/admin">
              <Button variant="outline">← Kembali</Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-primary">{ads.length}</p>
                <p className="text-sm text-text-secondary">Total</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-yellow-600">
                  {ads.filter(a => a.status === 'PENDING').length}
                </p>
                <p className="text-sm text-text-secondary">Menunggu</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-green-600">
                  {ads.filter(a => a.status === 'ACTIVE').length}
                </p>
                <p className="text-sm text-text-secondary">Aktif</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-gray-600">
                  {ads.filter(a => a.status === 'EXPIRED').length}
                </p>
                <p className="text-sm text-text-secondary">Kedaluwarsa</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-red-600">
                  {ads.filter(a => a.status === 'REJECTED').length}
                </p>
                <p className="text-sm text-text-secondary">Ditolak</p>
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
              variant={filterStatus === 'ACTIVE' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('ACTIVE')}
            >
              Aktif
            </Button>
            <Button
              variant={filterStatus === 'EXPIRED' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('EXPIRED')}
            >
              Kedaluwarsa
            </Button>
            <Button
              variant={filterStatus === 'REJECTED' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('REJECTED')}
            >
              Ditolak
            </Button>
          </div>

          {/* Ads Table */}
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : filteredAds.length > 0 ? (
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-text-secondary">Listing</th>
                      <th className="text-left py-3 px-4 font-medium text-text-secondary">Penyedia</th>
                      <th className="text-left py-3 px-4 font-medium text-text-secondary">Periode</th>
                      <th className="text-left py-3 px-4 font-medium text-text-secondary">Harga</th>
                      <th className="text-left py-3 px-4 font-medium text-text-secondary">Pembayaran</th>
                      <th className="text-left py-3 px-4 font-medium text-text-secondary">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-text-secondary">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAds.map((ad) => (
                      <tr key={ad.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">{ad.listing?.title || '-'}</td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="text-sm">{ad.user?.name || '-'}</p>
                            <p className="text-xs text-text-secondary">{ad.user?.email}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {ad.startDate ? formatDate(ad.startDate) : '-'} - {ad.endDate ? formatDate(ad.endDate) : '-'}
                        </td>
                        <td className="py-3 px-4 font-medium">Rp {formatPrice(ad.totalPrice)}</td>
                        <td className="py-3 px-4 text-sm">
                          {ad.paymentMethod === 'COD' ? 'COD' : 'Transfer'}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ad.status)}`}>
                            {getStatusLabel(ad.status)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {ad.status === 'PENDING' && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleApprove(ad.id)}
                              >
                                Setuju
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleReject(ad.id)}
                              >
                                Tolak
                              </Button>
                            </div>
                          )}
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                </svg>
                <h3 className="text-lg font-semibold mb-2">Tidak Ada Iklan</h3>
                <p className="text-text-secondary">Belum ada iklan dalam sistem</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
