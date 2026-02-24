'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Header } from '@/components/layout/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { formatPrice, formatDate } from '@/lib/utils'
import Link from 'next/link'

interface PromotionListing {
  id: string
  title: string
  slug: string
  description: string
  price: any
  images: string[]
  location: string
  promotionStatus: string
  promotionDays: number | null
  promotionStart: string | null
  promotionEnd: string | null
  user: {
    id: string
    name: string
    email: string
    phone: string
  }
  category: {
    name: string
  }
  promotion?: {
    id: string
    amount: any
    method: string
    proofImage: string | null
    status: string
    rejectionReason: string | null
    createdAt: string
  }
}

export default function AdminPromotionsPage() {
  const { data: session, status } = useSession()
  const [promotions, setPromotions] = useState<PromotionListing[]>([])
  const [allPromotions, setAllPromotions] = useState<PromotionListing[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('pending')
  const [showModal, setShowModal] = useState(false)
  const [selectedPromotion, setSelectedPromotion] = useState<PromotionListing | null>(null)
  const [action, setAction] = useState<'approve' | 'reject'>('approve')
  const [rejectReason, setRejectReason] = useState('')
  const [processing, setProcessing] = useState(false)
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (session && session.user.role === 'ADMIN') {
      setLoading(true)
      fetchPromotions()
    }
  }, [session, filter])

  const fetchPromotions = async () => {
    try {
      // Fetch all promotions for counts
      const allRes = await fetch('/api/admin/promotions', {
        credentials: 'include'
      })
      if (allRes.ok) {
        const allData = await allRes.json()
        const promotionsList = allData.promotions || []
        setAllPromotions(promotionsList)
      }

      // Fetch filtered promotions for display
      const res = await fetch(`/api/admin/promotions?status=${filter}`, {
        credentials: 'include'
      })
      if (res.ok) {
        const data = await res.json()
        setPromotions(data.promotions || [])
      }
    } catch (error) {
      console.error('Error fetching promotions:', error)
    } finally {
      setLoading(false)
    }
  }
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Aktif</span>
      case 'PENDING_APPROVAL':
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Menunggu</span>
      case 'WAITING_PAYMENT':
        return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">Menunggu Bayar</span>
      case 'PAYMENT_UPLOADED':
        return <span className="px-2 py-1 text-xs rounded-full bg-indigo-100 text-indigo-800">Verifikasi Bayar</span>
      case 'REJECTED':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Ditolak</span>
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">{status}</span>
    }
  }

  const handleAction = async (promotion: PromotionListing, act: 'approve' | 'reject') => {
    setSelectedPromotion(promotion)
    setAction(act)
    setShowModal(true)
  }

  const submitAction = async () => {
    if (!selectedPromotion) return

    if (action === 'reject' && !rejectReason) {
      alert('Mohon isi alasan penolakan')
      return
    }

    setProcessing(true)
    setSuccess('')

    try {
      const response = await fetch(`/api/admin/promotions/${selectedPromotion.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          reason: rejectReason
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Terjadi kesalahan')
      }

      setSuccess(data.message)
      setTimeout(() => {
        setShowModal(false)
        setSelectedPromotion(null)
        setRejectReason('')
        fetchPromotions()
      }, 1500)
    } catch (error) {
      console.error('Error processing promotion:', error)
      alert('Terjadi kesalahan')
    } finally {
      setProcessing(false)
    }
  }

  const tabs = [
    { value: 'pending', label: 'Menunggu Review', count: allPromotions.filter(p => p.promotionStatus === 'PENDING_APPROVAL').length },
    { value: 'active', label: 'Aktif', count: allPromotions.filter(p => p.promotionStatus === 'ACTIVE').length },
    { value: 'WAITING_PAYMENT', label: 'Menunggu Bayar', count: allPromotions.filter(p => p.promotionStatus === 'WAITING_PAYMENT').length },
    { value: 'PAYMENT_UPLOADED', label: 'Verifikasi Bayar', count: allPromotions.filter(p => p.promotionStatus === 'PAYMENT_UPLOADED').length },
    { value: 'REJECTED', label: 'Ditolak', count: allPromotions.filter(p => p.promotionStatus === 'REJECTED').length },
  ]

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#03a21d' }}></div>
      </div>
    )
  }

  if (!session || session.user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Akses Ditolak</h2>
          <p className="text-gray-600">Halaman ini hanya untuk admin</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto py-8 px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Kelola Promosi</h1>
                <p className="text-gray-600">Approve atau reject permintaan promosi dari provider</p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{promotions.filter(p => p.promotionStatus === 'PENDING_APPROVAL').length}</p>
                    <p className="text-sm text-gray-600">Menunggu</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{promotions.filter(p => p.promotionStatus === 'ACTIVE').length}</p>
                    <p className="text-sm text-gray-600">Aktif</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold" style={{ color: '#03a21d' }}>
                      Rp {formatPrice(
                        allPromotions
                          .filter(p => p.promotionStatus === 'ACTIVE' && p.promotion?.status === 'VERIFIED')
                          .reduce((sum, p) => sum + Number(p.promotion?.amount || 0), 0)
                          .toString()
                      )}
                    </p>
                    <p className="text-sm text-gray-600">Total Pendapatan</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{promotions.length}</p>
                    <p className="text-sm text-gray-600">Total</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {tabs.map(tab => (
              <button
                key={tab.value}
                onClick={() => setFilter(tab.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  filter === tab.value
                    ? 'text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border'
                }`}
                style={filter === tab.value ? { backgroundColor: '#03a21d' } : {}}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          {/* Table */}
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#03a21d' }}></div>
                </div>
              ) : promotions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Listing</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Provider</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Durasi</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Biaya</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {promotions.map(promotion => (
                        <tr key={promotion.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                {promotion.images?.[0] ? (
                                  <img src={promotion.images[0]} alt={promotion.title} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                  </div>
                                )}
                              </div>
                              <div>
                                <p className="font-medium line-clamp-1">{promotion.title}</p>
                                <p className="text-xs text-gray-500">{promotion.category?.name} - {promotion.location}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <p className="font-medium">{promotion.user?.name}</p>
                            <p className="text-xs text-gray-500">{promotion.user?.phone}</p>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-medium">{promotion.promotionDays || 0} hari</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-bold" style={{ color: '#03a21d' }}>
                              Rp {formatPrice(Number(promotion.promotion?.amount || 0).toString())}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {getStatusBadge(promotion.promotionStatus)}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              {promotion.promotionStatus === 'PENDING_APPROVAL' && (
                                <>
                                  <Button
                                    size="sm"
                                    style={{ backgroundColor: '#03a21d' }}
                                    onClick={() => handleAction(promotion, 'approve')}
                                  >
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-red-600 border-red-600 hover:bg-red-50"
                                    onClick={() => handleAction(promotion, 'reject')}
                                  >
                                    Tolak
                                  </Button>
                                </>
                              )}
                              {promotion.promotionStatus === 'PAYMENT_UPLOADED' && (
                                <>
                                  {promotion.promotion?.proofImage && (
                                    <a 
                                      href={promotion.promotion.proofImage} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-xs text-blue-600 underline mr-2"
                                    >
                                      Lihat Bukti
                                    </a>
                                  )}
                                  <Button
                                    size="sm"
                                    style={{ backgroundColor: '#03a21d' }}
                                    onClick={() => handleAction(promotion, 'approve')}
                                  >
                                    Verifikasi
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-red-600 border-red-600 hover:bg-red-50"
                                    onClick={() => handleAction(promotion, 'reject')}
                                  >
                                    Tolak
                                  </Button>
                                </>
                              )}
                              {promotion.promotionStatus === 'ACTIVE' && (
                                <span className="text-xs text-green-600 font-medium">Aktif hingga {promotion.promotionEnd ? formatDate(promotion.promotionEnd) : '-'}</span>
                              )}
                              {promotion.promotionStatus === 'WAITING_PAYMENT' && (
                                <span className="text-xs text-blue-600">Menunggu pembayaran</span>
                              )}
                              {promotion.promotionStatus === 'REJECTED' && (
                                <span className="text-xs text-red-600">Ditolak: {promotion.promotion?.rejectionReason || '-'}</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-lg font-semibold mb-2">Tidak Ada Data</h3>
                  <p className="text-gray-600">Tidak ada permintaan promosi dengan filter ini</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Modal */}
      {showModal && selectedPromotion && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>
                {action === 'approve' ? 'Approve Promosi' : 'Tolak Promosi'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {success && (
                <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-lg text-sm">
                  {success}
                </div>
              )}
              
              <div className="mb-4">
                <p className="text-sm text-gray-600">Listing:</p>
                <p className="font-medium">{selectedPromotion.title}</p>
              </div>
              
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Durasi: {selectedPromotion.promotionDays} hari</p>
                <p className="text-sm text-gray-600">Biaya: Rp {formatPrice(Number(selectedPromotion.promotion?.amount || 0).toString())}</p>
                <p className="text-sm text-gray-600">Provider: {selectedPromotion.user?.name}</p>
              </div>

              {action === 'reject' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Alasan Penolakan</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    rows={3}
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Tulis alasan penolakan..."
                    required
                  />
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowModal(false)
                    setSelectedPromotion(null)
                    setRejectReason('')
                  }}
                  disabled={processing}
                >
                  Batal
                </Button>
                <Button
                  className="flex-1"
                  style={action === 'approve' ? { backgroundColor: '#03a21d' } : { backgroundColor: '#dc2626' }}
                  onClick={submitAction}
                  disabled={processing}
                >
                  {processing ? 'Memproses...' : action === 'approve' ? 'Approve' : 'Tolak'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
