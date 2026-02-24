'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { formatPrice } from '@/lib/utils'

const PRICE_PER_DAY = 1000

interface Listing {
  id: string
  title: string
  category: {
    name: string
  }
  promotionDays?: number | null
  promotionEnd?: string | Date | null
}

interface BankAccount {
  id: string
  name: string
  accountNumber: string
  accountName: string
  type: 'BANK' | 'E_WALLET' | 'PULSA'
  isDefault: boolean
}

interface Props {
  listing: Listing
  action: 'promote' | 'stop' | 'pay'
}

export function PromotionModal({ listing, action }: Props) {
  const [showModal, setShowModal] = useState(false)
  const [days, setDays] = useState(7)
  const [method, setMethod] = useState('TRANSFER')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([])
  const [selectedBank, setSelectedBank] = useState<BankAccount | null>(null)

  useEffect(() => {
    if (showModal && action === 'pay') {
      fetchBankAccounts()
    }
  }, [showModal, action])

  const fetchBankAccounts = async () => {
    try {
      const res = await fetch('/api/bank-accounts')
      if (res.ok) {
        const data = await res.json()
        setBankAccounts(data)
        // Set default bank account
        const defaultAccount = data.find((acc: BankAccount) => acc.isDefault)
        if (defaultAccount) {
          setSelectedBank(defaultAccount)
        } else if (data.length > 0) {
          setSelectedBank(data[0])
        }
      }
    } catch (error) {
      console.error('Error fetching bank accounts:', error)
    }
  }

  const handlePromote = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const res = await fetch(`/api/provider/listings/${listing.id}/promote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ days, method }),
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error)

      setSuccess(data.message)
      setTimeout(() => {
        setShowModal(false)
        window.location.reload()
      }, 1500)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleStop = async () => {
    setLoading(true)
    setError('')

    try {
      const res = await fetch(`/api/provider/listings/${listing.id}/stop-promotion`, {
        method: 'POST',
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error)

      setSuccess('Promosi berhasil dihentikan')
      setTimeout(() => {
        setShowModal(false)
        window.location.reload()
      }, 1500)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleUploadProof = async (e: React.FormEvent) => {
    e.preventDefault()
    const fileInput = (e.target as HTMLFormElement).elements.namedItem('proof') as HTMLInputElement
    const file = fileInput?.files?.[0]

    if (!file) {
      setError('Pilih bukti pembayaran')
      return
    }

    setLoading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('proof', file)
      formData.append('listingId', listing.id)

      const res = await fetch('/api/provider/promotions/upload-proof', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error)

      setSuccess('Bukti berhasil diupload!')
      setTimeout(() => {
        setShowModal(false)
        window.location.reload()
      }, 1500)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {action === 'promote' && (
        <Button
          size="sm"
          onClick={() => setShowModal(true)}
          style={{ backgroundColor: '#03a21d' }}
        >
          Promosikan
        </Button>
      )}
      {action === 'stop' && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowModal(true)}
          className="text-red-600 border-red-600 hover:bg-red-50"
        >
          Batalkan
        </Button>
      )}
      {action === 'pay' && (
        <Button
          size="sm"
          onClick={() => setShowModal(true)}
          style={{ backgroundColor: '#03a21d' }}
        >
          Bayar
        </Button>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>
                {action === 'promote' && 'Promosikan Listing'}
                {action === 'stop' && 'Batalkan Promosi'}
                {action === 'pay' && 'Upload Bukti Pembayaran'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {error && <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-lg text-sm">{error}</div>}
              {success && <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-lg text-sm">{success}</div>}

              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="font-medium">{listing.title}</p>
                <p className="text-sm text-gray-500">{listing.category?.name}</p>
              </div>

              {action === 'promote' && (
                <form onSubmit={handlePromote} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Jumlah Hari</label>
                    <Input
                      type="number"
                      min="1"
                      max="365"
                      value={days}
                      onChange={(e) => setDays(parseInt(e.target.value) || 1)}
                      required
                    />
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg text-center">
                    <p className="text-sm text-gray-600">Total Biaya</p>
                    <p className="text-2xl font-bold" style={{ color: '#03a21d' }}>
                      Rp {formatPrice((days * PRICE_PER_DAY).toString())}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Metode Pembayaran</label>
                    <select
                      className="w-full px-3 py-2 border rounded-lg"
                      value={method}
                      onChange={(e) => setMethod(e.target.value)}
                    >
                      <option value="TRANSFER">Transfer Bank</option>
                      <option value="COD">COD</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" className="flex-1" onClick={() => setShowModal(false)}>Batal</Button>
                    <Button type="submit" className="flex-1" style={{ backgroundColor: '#03a21d' }} disabled={loading}>
                      {loading ? '...' : 'Ajukan'}
                    </Button>
                  </div>
                </form>
              )}

              {action === 'stop' && (
                <div className="space-y-4">
                  <p className="text-gray-600">Apakah Anda yakin ingin menghentikan promosi ini?</p>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" className="flex-1" onClick={() => setShowModal(false)}>Batal</Button>
                    <Button className="flex-1" style={{ backgroundColor: '#dc2626' }} onClick={handleStop} disabled={loading}>
                      {loading ? '...' : 'Ya, Hentikan'}
                    </Button>
                  </div>
                </div>
              )}

              {action === 'pay' && (
                <form onSubmit={handleUploadProof} className="space-y-4">
                  <div className="p-3 bg-green-50 rounded-lg text-center">
                    <p className="text-sm text-gray-600">Total Pembayaran</p>
                    <p className="text-2xl font-bold" style={{ color: '#03a21d' }}>
                      Rp {formatPrice(((listing.promotionDays || 7) * PRICE_PER_DAY).toString())}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Bukti Pembayaran</label>
                    <input type="file" name="proof" accept="image/*" className="w-full px-3 py-2 border rounded-lg" required />
                  </div>
                  {bankAccounts.length > 0 ? (
                    <div className="p-3 bg-blue-50 rounded-lg text-sm">
                      <p className="font-medium mb-2">Transfer ke:</p>
                      {bankAccounts.map((bank) => (
                        <div 
                          key={bank.id} 
                          className={`p-2 rounded cursor-pointer ${selectedBank?.id === bank.id ? 'bg-blue-100 border-2 border-blue-500' : 'bg-white'}`}
                          onClick={() => setSelectedBank(bank)}
                        >
                          <p className="font-medium">{bank.name}</p>
                          <p>No. Rek: {bank.accountNumber}</p>
                          <p>A/N: {bank.accountName}</p>
                          {bank.isDefault && <span className="text-xs text-blue-600">(Utama)</span>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 bg-yellow-50 rounded-lg text-sm text-yellow-700">
                      <p className="font-medium">Belum ada rekening pembayaran.</p>
                      <p className="text-xs">Silakan hubungi admin untuk info rekening.</p>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" className="flex-1" onClick={() => setShowModal(false)}>Batal</Button>
                    <Button type="submit" className="flex-1" style={{ backgroundColor: '#03a21d' }} disabled={loading || bankAccounts.length === 0}>
                      {loading ? '...' : 'Kirim'}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}
