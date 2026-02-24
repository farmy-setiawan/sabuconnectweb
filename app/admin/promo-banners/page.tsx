'use client'

import { useState, useEffect } from 'react'
import { redirect } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface PromoBanner {
  id: string
  title: string
  subtitle: string | null
  image: string
  link: string | null
  position: string
  isActive: boolean
  order: number
  startDate: string | null
  endDate: string | null
  createdAt: string
}

const POSITIONS = [
  { value: 'hero', label: 'Hero (Banner Utama)' },
  { value: 'below_hero', label: 'Di Bawah Hero' },
  { value: 'middle', label: 'Tengah Halaman' },
  { value: 'footer', label: 'Footer' },
]

export default function AdminPromoBannersPage() {
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(true)
  const [banners, setBanners] = useState<PromoBanner[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingBanner, setEditingBanner] = useState<PromoBanner | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    image: '',
    link: '',
    position: 'hero',
    isActive: true,
    order: 0,
    startDate: '',
    endDate: '',
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
      fetchBanners()
    }
  }, [session])

  const fetchBanners = async () => {
    try {
      const res = await fetch('/api/admin/promo-banners')
      if (res.ok) {
        const data = await res.json()
        setBanners(data)
      }
    } catch (error) {
      console.error('Error fetching banners:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  const openModal = (banner?: PromoBanner) => {
    if (banner) {
      setEditingBanner(banner)
      setFormData({
        title: banner.title,
        subtitle: banner.subtitle || '',
        image: banner.image,
        link: banner.link || '',
        position: banner.position,
        isActive: banner.isActive,
        order: banner.order,
        startDate: banner.startDate ? banner.startDate.split('T')[0] : '',
        endDate: banner.endDate ? banner.endDate.split('T')[0] : '',
      })
    } else {
      setEditingBanner(null)
      setFormData({
        title: '',
        subtitle: '',
        image: '',
        link: '',
        position: 'hero',
        isActive: true,
        order: 0,
        startDate: '',
        endDate: '',
      })
    }
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const url = editingBanner 
        ? `/api/admin/promo-banners/${editingBanner.id}`
        : '/api/admin/promo-banners'
      
      const method = editingBanner ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          startDate: formData.startDate || null,
          endDate: formData.endDate || null,
        }),
      })

      if (res.ok) {
        setShowModal(false)
        fetchBanners()
      }
    } catch (error) {
      console.error('Error saving banner:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus banner ini?')) return
    
    setDeleting(id)
    try {
      const res = await fetch(`/api/admin/promo-banners/${id}`, {
        method: 'DELETE',
      })
      
      if (res.ok) {
        fetchBanners()
      }
    } catch (error) {
      console.error('Error deleting banner:', error)
    } finally {
      setDeleting(null)
    }
  }

  const handleToggleActive = async (banner: PromoBanner) => {
    try {
      const res = await fetch(`/api/admin/promo-banners/${banner.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !banner.isActive }),
      })
      
      if (res.ok) {
        fetchBanners()
      }
    } catch (error) {
      console.error('Error toggling banner:', error)
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
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-text-primary">Kelola Promo Banner</h1>
              <p className="text-text-secondary">Tambahkan dan kelola banner promosi di homepage</p>
            </div>
            <Button onClick={() => openModal()}>
              + Tambah Banner
            </Button>
          </div>

          {/* Banner List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {banners.map((banner) => (
              <Card key={banner.id} className={!banner.isActive ? 'opacity-60' : ''}>
                <div className="aspect-video relative overflow-hidden rounded-t-lg">
                  <img 
                    src={banner.image} 
                    alt={banner.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      banner.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {banner.isActive ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-1">{banner.title}</h3>
                  {banner.subtitle && (
                    <p className="text-sm text-text-secondary mb-2">{banner.subtitle}</p>
                  )}
                  <div className="flex items-center gap-2 text-xs text-text-secondary mb-4">
                    <span className="px-2 py-1 bg-gray-100 rounded">
                      {POSITIONS.find(p => p.value === banner.position)?.label || banner.position}
                    </span>
                    <span>Order: {banner.order}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleToggleActive(banner)}
                    >
                      {banner.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => openModal(banner)}
                    >
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDelete(banner.id)}
                      disabled={deleting === banner.id}
                    >
                      {deleting === banner.id ? '...' : 'Hapus'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {banners.length === 0 && (
              <div className="col-span-full text-center py-12 text-text-secondary">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-lg font-medium">Belum ada banner</p>
                <p className="text-sm">Klik tombol "Tambah Banner" untuk menambahkan</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-6">
                {editingBanner ? 'Edit Banner' : 'Tambah Banner Baru'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Gambar Banner *
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="w-48 h-28 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden bg-gray-50">
                      {formData.image ? (
                        <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-gray-400 text-sm">Belum ada gambar</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="w-full px-3 py-2 border border-border rounded-lg"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Format: JPG, PNG. Rekomendasi: 1200x600px
                      </p>
                    </div>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Judul Banner *
                  </label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Contoh: Promo Spesial Hari Raya"
                    required
                  />
                </div>

                {/* Subtitle */}
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Subjudul
                  </label>
                  <Input
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    placeholder="Contoh: Diskon hingga 50%"
                  />
                </div>

                {/* Link */}
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Link (Opsional)
                  </label>
                  <Input
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                    placeholder="https://..."
                  />
                </div>

                {/* Position & Order */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Posisi
                    </label>
                    <select
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-lg"
                    >
                      {POSITIONS.map((pos) => (
                        <option key={pos.value} value={pos.value}>
                          {pos.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Urutan
                    </label>
                    <Input
                      type="number"
                      value={formData.order}
                      onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                      min="0"
                    />
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Tanggal Mulai
                    </label>
                    <Input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Tanggal Berakhir
                    </label>
                    <Input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    />
                  </div>
                </div>

                {/* Active Toggle */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-primary rounded"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium">
                    Aktifkan banner
                  </label>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4 pt-4">
                  <Button type="submit" disabled={saving || !formData.image || !formData.title}>
                    {saving ? 'Menyimpan...' : editingBanner ? 'Simpan Perubahan' : 'Tambah Banner'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowModal(false)}
                  >
                    Batal
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
