'use client'

import { useState, useEffect } from 'react'
import { redirect } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'

interface BankAccount {
  id: string
  name: string
  accountNumber: string
  accountName: string
  type: 'BANK' | 'E_WALLET' | 'PULSA'
  isActive: boolean
  isDefault: boolean
  createdAt: string
}

export default function AdminBankAccountsPage() {
  const { data: session, status } = useSession()
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    accountNumber: '',
    accountName: '',
    type: 'BANK' as 'BANK' | 'E_WALLET' | 'PULSA',
    isDefault: false,
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/login')
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      redirect('/')
    }
  }, [status, session])

  useEffect(() => {
    if (session?.user?.role === 'ADMIN') {
      fetchBankAccounts()
    }
  }, [session])

  const fetchBankAccounts = async () => {
    try {
      const res = await fetch('/api/admin/bank-accounts')
      if (res.ok) {
        const data = await res.json()
        setBankAccounts(data)
      }
    } catch (error) {
      console.error('Error fetching bank accounts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/admin/bank-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        fetchBankAccounts()
        setShowForm(false)
        setFormData({
          name: '',
          accountNumber: '',
          accountName: '',
          type: 'BANK',
          isDefault: false,
        })
      }
    } catch (error) {
      console.error('Error creating bank account:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus rekening ini?')) return

    try {
      const res = await fetch(`/api/admin/bank-accounts/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        fetchBankAccounts()
      }
    } catch (error) {
      console.error('Error deleting bank account:', error)
    }
  }

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/bank-accounts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      })

      if (res.ok) {
        fetchBankAccounts()
      }
    } catch (error) {
      console.error('Error toggling bank account:', error)
    }
  }

  const handleSetDefault = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/bank-accounts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDefault: true }),
      })

      if (res.ok) {
        fetchBankAccounts()
      }
    } catch (error) {
      console.error('Error setting default:', error)
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'BANK':
        return 'Bank'
      case 'E_WALLET':
        return 'E-Wallet'
      case 'PULSA':
        return 'Pulsa'
      default:
        return type
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'BANK':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        )
      case 'E_WALLET':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        )
      case 'PULSA':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        )
      default:
        return null
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        <div className="container-app py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-text-primary">Kelola Rekening & Wallet</h1>
              <p className="text-text-secondary">Kelola rekening untuk menerima pembayaran promosi</p>
            </div>
            <Button onClick={() => setShowForm(!showForm)}>
              {showForm ? 'Batal' : 'Tambah Rekening'}
            </Button>
          </div>

          {/* Add Form */}
          {showForm && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Tambah Rekening Baru</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">
                        Nama Bank/Wallet
                      </label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Contoh: BCA, GoPay, Dana"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">
                        Jenis
                      </label>
                      <Select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                        options={[
                          { label: 'Bank', value: 'BANK' },
                          { label: 'E-Wallet', value: 'E_WALLET' },
                          { label: 'Pulsa', value: 'PULSA' },
                        ]}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">
                        Nomor Rekening/No. HP
                      </label>
                      <Input
                        value={formData.accountNumber}
                        onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                        placeholder="Contoh: 1234567890"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">
                        Nama Pemilik Rekening
                      </label>
                      <Input
                        value={formData.accountName}
                        onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                        placeholder="Contoh: PT SABUConnect"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isDefault"
                      checked={formData.isDefault}
                      onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                      className="w-4 h-4 text-primary"
                    />
                    <label htmlFor="isDefault" className="text-sm text-text-secondary">
                      Jadikan rekening utama
                    </label>
                  </div>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Menyimpan...' : 'Simpan'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Bank Accounts List */}
          {bankAccounts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bankAccounts.map((account) => (
                <Card key={account.id} className={!account.isActive ? 'opacity-60' : ''}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        account.type === 'BANK' 
                          ? 'bg-blue-100 text-blue-600' 
                          : account.type === 'E_WALLET'
                          ? 'bg-purple-100 text-purple-600'
                          : 'bg-green-100 text-green-600'
                      }`}>
                        {getTypeIcon(account.type)}
                      </div>
                      <div className="flex gap-2">
                        {account.isDefault && (
                          <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                            Utama
                          </span>
                        )}
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          account.isActive 
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-red-100 text-red-600'
                        }`}>
                          {account.isActive ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </div>
                    </div>
                    
                    <h3 className="font-semibold text-lg mb-1">{account.name}</h3>
                    <p className="text-2xl font-bold text-primary mb-1">{account.accountNumber}</p>
                    <p className="text-text-secondary text-sm mb-4">{account.accountName}</p>
                    <p className="text-xs text-text-secondary mb-4">{getTypeLabel(account.type)}</p>
                    
                    <div className="flex gap-2">
                      {!account.isDefault && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleSetDefault(account.id)}
                        >
                          Jadikan Utama
                        </Button>
                      )}
                      <Button 
                        variant={account.isActive ? 'outline' : 'primary'} 
                        size="sm"
                        onClick={() => handleToggleActive(account.id, account.isActive)}
                      >
                        {account.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-red-500 hover:text-red-600"
                        onClick={() => handleDelete(account.id)}
                      >
                        Hapus
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                <h3 className="text-lg font-medium text-text-primary mb-2">Belum Ada Rekening</h3>
                <p className="text-text-secondary mb-4">Tambahkan rekening untuk menerima pembayaran dari provider</p>
                <Button onClick={() => setShowForm(true)}>
                  Tambah Rekening Pertama
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
