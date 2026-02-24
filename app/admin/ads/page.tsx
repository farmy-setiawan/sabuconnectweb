'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { formatPrice, formatDate } from '@/lib/utils'

interface Ad {
  id: string
  title: string
  description: string | null
  location: string | null
  status: string
  paymentMethod: string
  paymentStatus: string
  price: string
  startDate: string
  endDate: string
  createdAt: string
  user: {
    name: string | null
    email: string
  }
  payment?: {
    id: string
    proofImage: string | null
    status: string
    updatedAt: string
  } | null
}

export default function AdminAdsPage() {
  const { data: session, status } = useSession()
  const [ads, setAds] = useState<Ad[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    if (session) {
      fetchData()
    }
  }, [session])

  const fetchData = async () => {
    try {
      const res = await fetch('/api/admin/ads')
      if (res.ok) {
        const data = await res.json()
        setAds(data)
      }
    } catch (error) {
      console.error('Error fetching ads:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800'
      case 'PENDING_APPROVAL':
        return 'bg-yellow-100 text-yellow-800'
      case 'WAITING_PAYMENT':
        return 'bg-blue-100 text-blue-800'
      case 'REJECTED':
        return 'bg-red-100 text-red-800'
      case 'EXPIRED':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Aktif'
      case 'PENDING_APPROVAL':
        return 'Menunggu Review'
      case 'WAITING_PAYMENT':
        return 'Menunggu Pembayaran'
      case 'REJECTED':
        return 'Ditolak'
      case 'EXPIRED':
        return 'Kedaluwarsa'
      case 'DRAFT':
        return 'Draft'
      default:
        return status
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-800'
      case 'VERIFICATION':
        return 'bg-blue-100 text-blue-800'
      case 'PENDING_COD':
        return 'bg-purple-100 text-purple-800'
      case 'PAYMENT_REJECTED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentStatusLabel = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'Lunas'
      case 'VERIFICATION':
        return 'Menunggu Verifikasi'
      case 'PENDING_COD':
        return 'Menunggu COD'
      case 'PAYMENT_REJECTED':
        return 'Pembayaran Ditolak'
      default:
        return 'Belum Bayar'
    }
  }

  const handleApprove = async (adId: string) => {
    setActionLoading(true)
    try {
      const res = await fetch(`/api/admin/ads/${adId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'WAITING_PAYMENT' }),
      })

      if (res.ok) {
        fetchData()
        setShowDetailModal(false)
      }
    } catch (error) {
      console.error('Error approving ad:', error)
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async (adId: string) => {
    setActionLoading(true)
    try {
      const res = await fetch(`/api/admin/ads/${adId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'REJECTED' }),
      })

      if (res.ok) {
        fetchData()
        setShowDetailModal(false)
      }
    } catch (error) {
      console.error('Error rejecting ad:', error)
    } finally {
      setActionLoading(false)
    }
  }

  const handleVerifyPayment = async (adId: string, action: 'approve' | 'reject') => {
    setActionLoading(true)
    try {
      const res = await fetch(`/api/admin/ads/${adId}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })

      if (res.ok) {
        fetchData()
        setShowDetailModal(false)
      }
    } catch (error) {
      console.error('Error verifying payment:', error)
    } finally {
      setActionLoading(false)
    }
  }

  const filteredAds = ads.filter((ad) => {
    if (filter === 'all') return true
    return ad.status === filter
  })

  const pendingApproval = ads.filter(a => a.status === 'PENDING_APPROVAL').length
  const waitingPayment = ads.filter(a => a.status === 'WAITING_PAYMENT').length
  const pendingVerification = ads.filter(a => a.paymentStatus === 'VERIFICATION').length
  const activeAds = ads.filter(a => a.status === 'ACTIVE').length

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
            <h1 className="text-2xl font-bold text-text-primary">Kelola Iklan</h1>
            <p className="text-text-secondary">Kelola pengajuan dan pembayaran iklan</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-yellow-600">{pendingApproval}</p>
                <p className="text-sm text-yellow-700">Menunggu Review</p>
              </CardContent>
            </Card>
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-blue-600">{waitingPayment}</p>
                <p className="text-sm text-blue-700">Menunggu Pembayaran</p>
              </CardContent>
            </Card>
            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-purple-600">{pendingVerification}</p>
                <p className="text-sm text-purple-700">Verifikasi Pembayaran</p>
              </CardContent>
            </Card>
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-green-600">{activeAds}</p>
                <p className="text-sm text-green-700">Iklan Aktif</p>
              </CardContent>
            </Card>
          </div>

          {/* Filter */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            <Button
              variant={filter === 'all' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              Semua
            </Button>
            <Button
              variant={filter === 'PENDING_APPROVAL' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilter('PENDING_APPROVAL')}
            >
              Menunggu Review
            </Button>
            <Button
              variant={filter === 'WAITING_PAYMENT' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilter('WAITING_PAYMENT')}
            >
              Menunggu Pembayaran
            </Button>
            <Button
              variant={filter === 'ACTIVE' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilter('ACTIVE')}
            >
              Aktif
            </Button>
            <Button
              variant={filter === 'REJECTED' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilter('REJECTED')}
            >
              Ditolak
            </Button>
            <Button
              variant={filter === 'EXPIRED' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilter('EXPIRED')}
            >
              Kedaluwarsa
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
                      <th className="text-left py-3 px-4 font-medium text-text-secondary">Judul</th>
                      <th className="text-left py-3 px-4 font-medium text-text-secondary">Provider</th>
                      <th className="text-left py-3 px-4 font-medium text-text-secondary">Durasi</th>
                      <th className="text-left py-3 px-4 font-medium text-text-secondary">Harga</th>
                      <th className="text-left py-3 px-4 font-medium text-text-secondary">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-text-secondary">Pembayaran</th>
                      <th className="text-left py-3 px-4 font-medium text-text-secondary">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAds.map((ad) => (
                      <tr key={ad.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">{ad.title}</td>
                        <td className="py-3 px-4 text-sm">
                          <div>
                            <p className="font-medium">{ad.user.name || '-'}</p>
                            <p className="text-text-secondary">{ad.user.email}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {formatDate(ad.startDate)} - {formatDate(ad.endDate)}
                        </td>
                        <td className="py-3 px-4 font-medium">Rp {formatPrice(ad.price)}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ad.status)}`}>
                            {getStatusLabel(ad.status)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(ad.paymentStatus)}`}>
                            {getPaymentStatusLabel(ad.paymentStatus)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedAd(ad)
                              setShowDetailModal(true)
                            }}
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
                <p className="text-text-secondary">Tidak ada iklan</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Detail Modal */}
      {showDetailModal && selectedAd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Detail Iklan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-text-secondary">Judul</label>
                  <p className="font-medium">{selectedAd.title}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-text-secondary">Deskripsi</label>
                  <p className="text-sm">{selectedAd.description || '-'}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-text-secondary">Lokasi Target</label>
                  <p className="text-sm">{selectedAd.location || '-'}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-text-secondary">Tanggal Mulai</label>
                    <p className="text-sm">{formatDate(selectedAd.startDate)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-text-secondary">Tanggal Berakhir</label>
                    <p className="text-sm">{formatDate(selectedAd.endDate)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-text-secondary">Metode Pembayaran</label>
                    <p className="text-sm">{selectedAd.paymentMethod === 'TRANSFER' ? 'Transfer Bank' : 'COD'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-text-secondary">Total Harga</label>
                    <p className="text-sm font-bold text-primary">Rp {formatPrice(selectedAd.price)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-text-secondary">Status</label>
                    <div className="mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedAd.status)}`}>
                        {getStatusLabel(selectedAd.status)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-text-secondary">Status Pembayaran</label>
                    <div className="mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(selectedAd.paymentStatus)}`}>
                        {getPaymentStatusLabel(selectedAd.paymentStatus)}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-text-secondary">Provider</label>
                  <p className="text-sm">{selectedAd.user.name || '-'}</p>
                  <p className="text-xs text-text-secondary">{selectedAd.user.email}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-text-secondary">Diajukan</label>
                  <p className="text-sm">{formatDate(selectedAd.createdAt)}</p>
                </div>

                {/* Payment Proof Section */}
                {selectedAd.payment?.proofImage && (
                  <div>
                    <label className="text-sm font-medium text-text-secondary">Bukti Pembayaran</label>
                    <div className="mt-2">
                      <img
                        src={selectedAd.payment.proofImage}
                        alt="Bukti Pembayaran"
                        className="max-w-xs rounded-lg border"
                      />
                      <p className="text-xs text-text-secondary mt-1">
                        Diupload: {formatDate(selectedAd.payment.updatedAt)}
                      </p>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2 pt-4 border-t">
                  {selectedAd.status === 'PENDING_APPROVAL' && (
                    <>
                      <Button
                        onClick={() => handleApprove(selectedAd.id)}
                        disabled={actionLoading}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Setuju & Minta Bayar
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleReject(selectedAd.id)}
                        disabled={actionLoading}
                      >
                        Tolak
                      </Button>
                    </>
                  )}

                  {selectedAd.status === 'WAITING_PAYMENT' && selectedAd.paymentMethod === 'COD' && (
                    <Button
                      onClick={() => handleVerifyPayment(selectedAd.id, 'approve')}
                      disabled={actionLoading}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Konfirmasi COD Diterima
                    </Button>
                  )}

                  {selectedAd.status === 'WAITING_PAYMENT' && selectedAd.paymentStatus === 'VERIFICATION' && (
                    <>
                      <Button
                        onClick={() => handleVerifyPayment(selectedAd.id, 'approve')}
                        disabled={actionLoading}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Verifikasi Pembayaran
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleVerifyPayment(selectedAd.id, 'reject')}
                        disabled={actionLoading}
                      >
                        Tolak Pembayaran
                      </Button>
                    </>
                  )}

                  <Button
                    variant="outline"
                    onClick={() => setShowDetailModal(false)}
                  >
                    Tutup
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Footer />
    </div>
  )
}
