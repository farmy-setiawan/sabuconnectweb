'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Badge } from '@/components/ui/Badge'

interface ProviderProfile {
  id: string
  name: string
  email: string
  phone: string
  role: string
  isVerified: boolean
  createdAt: string
}

export default function ProviderProfilePage() {
  const { data: session, status, update } = useSession()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState<ProviderProfile | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
  })

  useEffect(() => {
    if (session?.user) {
      fetchProfile()
    }
  }, [session])

  const fetchProfile = async () => {
    try {
      // Get profile data from session
      setFormData({
        name: session?.user?.name || '',
        phone: session?.user?.phone || '',
      })
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Terjadi kesalahan')
      }

      // Update session
      await update({
        ...session,
        user: {
          ...session?.user,
          name: formData.name,
          phone: formData.phone,
        }
      })

      setSuccess('Profil berhasil diperbarui!')
      setIsEditing(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan')
    } finally {
      setLoading(false)
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
          <p className="text-text-secondary mb-4">Halaman ini hanya untuk penyedia jasa</p>
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
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <Link href="/provider" className="text-primary hover:underline text-sm mb-2 inline-flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Kembali
              </Link>
              <h1 className="text-2xl font-bold text-text-primary">Profil Penyedia</h1>
              <p className="text-text-secondary">Kelola informasi usaha Anda</p>
            </div>

            {/* Success/Error Messages */}
            {success && (
              <div className="mb-4 p-4 bg-green-100 text-green-800 rounded-lg">
                {success}
              </div>
            )}
            {error && (
              <div className="mb-4 p-4 bg-red-100 text-red-800 rounded-lg">
                {error}
              </div>
            )}

            {/* Profile Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Informasi Profil</CardTitle>
                  {!isEditing && (
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                      Edit
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Nama Lengkap / Nama Usaha</label>
                      <Input
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Nama lengkap atau nama usaha"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Nomor WhatsApp</label>
                      <Input
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="628xxxxx (tanpa +)"
                        required
                      />
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button type="submit" disabled={loading}>
                        {loading ? 'Menyimpan...' : 'Simpan'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsEditing(false)
                          setFormData({
                            name: session?.user?.name || '',
                            phone: session?.user?.phone || '',
                          })
                        }}
                      >
                        Batal
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 pb-4 border-b">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-2xl font-bold text-primary">
                          {session?.user?.name?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{session?.user?.name || '-'}</h3>
                        <p className="text-text-secondary">{session?.user?.email}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-text-secondary">Role</p>
                        <p className="font-medium">
                          {session?.user?.role === 'ADMIN' ? 'Administrator' : 'Penyedia Jasa'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-text-secondary">Nomor WhatsApp</p>
                        <p className="font-medium">{session?.user?.phone || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-text-secondary">Status Verifikasi</p>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            session?.user?.isVerified 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {session?.user?.isVerified ? 'Terverifikasi' : 'Menunggu'}
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-text-secondary">Akun Dibuat</p>
                        <p className="font-medium">-</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Account Info */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Informasi Akun</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b">
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-sm text-text-secondary">{session?.user?.email}</p>
                  </div>
                  <Badge variant="default">Tidak dapat diubah</Badge>
                </div>
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium">Password</p>
                    <p className="text-sm text-text-secondary">••••••••</p>
                  </div>
                  <Link href="/forgot-password">
                    <Button variant="outline" size="sm">Ubah</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Statistik</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-primary/5 rounded-lg">
                    <p className="text-2xl font-bold text-primary">-</p>
                    <p className="text-sm text-text-secondary">Total Listing</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">-</p>
                    <p className="text-sm text-text-secondary">Transaksi</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
