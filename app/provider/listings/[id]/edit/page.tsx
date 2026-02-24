'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { LocationAutocomplete } from '@/components/ui/LocationAutocomplete'

const categories = [
  { label: 'Pilih Kategori', value: '' },
  { label: 'Konstruksi & Bangunan', value: 'konstruksi-bangunan' },
  { label: 'Reparasi & Montir', value: 'reparasi-montir' },
  { label: 'Servis Elektronik', value: 'servis-elektronik' },
  { label: 'Salon & Kecantikan', value: 'salon-kecantikan' },
  { label: 'Pendidikan & Les Privat', value: 'pendidikan-les-privat' },
  { label: 'Kesehatan & Fitness', value: 'kesehatan-fitness' },
  { label: 'Transportasi', value: 'transportasi' },
  { label: 'Layanan Rumah Tangga', value: 'layanan-rumah-tangga' },
  { label: 'Fotografi & Videografi', value: 'fotografi-videografi' },
  { label: 'Jasa Lainnya', value: 'jasa-lainnya' },
  { label: 'Hasil Pertanian', value: 'hasil-pertanian' },
  { label: 'Hasil Laut & Perikan', value: 'hasil-laut-perikan' },
  { label: 'Kerajinan Tangan', value: 'kerajinan-tangan' },
  { label: 'Makanan & Minuman', value: 'makanan-minuman' },
  { label: 'Pakaian & Tekstil', value: 'pakaian-tekstil' },
  { label: 'Tanaman & Bibit', value: 'tanaman-bibit' },
  { label: 'Ternak & Peternakan', value: 'ternak-peternakan' },
  { label: 'Produk Lainnya', value: 'produk-lainnya' },
]

// Sample data for demo
const sampleListing = {
  id: '1',
  title: 'Jasa Service AC Profesional',
  description: 'Melayani service AC rumah, kantor, dan toko. Gratis ongkos kirim untuk area Waikabubak dan sekitarnya. Teknisi berpengalaman.',
  categoryId: 'servis-elektronik',
  price: 150000,
  priceType: 'FIXED',
  location: 'Kota Waikabubak',
  phone: '6281234567890',
  status: 'ACTIVE',
}

export default function EditListingPage() {
  const router = useRouter()
  const params = useParams()
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: '',
    price: '',
    priceType: 'FIXED',
    location: '',
    phone: '',
    status: 'ACTIVE',
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [currentImages, setCurrentImages] = useState<string[]>([])

  useEffect(() => {
    // Fetch listing data from API
    const fetchListing = async () => {
      try {
        const res = await fetch(`/api/listings?userId=${session?.user?.id}`)
        if (res.ok) {
          const data = await res.json()
          const listing = data.listings?.find((l: any) => l.id === params.id)
          if (listing) {
            setFormData({
              title: listing.title || '',
              description: listing.description || '',
              categoryId: listing.categoryId || '',
              price: listing.price?.toString() || '',
              priceType: listing.priceType || 'FIXED',
              location: listing.location || '',
              phone: listing.phone || '',
              status: listing.status || 'ACTIVE',
            })
            setCurrentImages(listing.images || [])
            if (listing.images?.[0]) {
              setImagePreview(listing.images[0])
            }
          }
        }
      } catch (error) {
        console.error('Error fetching listing:', error)
      }
    }
    
    if (session?.user?.id && params.id) {
      fetchListing()
    }
  }, [session, params.id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSaving(true)

    try {
      // Convert image to data URL if selected
      let images = currentImages
      if (imageFile) {
        const reader = new FileReader()
        const imageData = await new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string)
          reader.readAsDataURL(imageFile)
        })
        images = [imageData]
      }

      const response = await fetch(`/api/provider/listings/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          images,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Terjadi kesalahan')
      }
      
      setSuccess('Listing berhasil diperbarui!')
      setTimeout(() => {
        router.push('/provider/listings')
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Apakah Anda yakin ingin menghapus listing ini?')) return
    
    setLoading(true)
    try {
      // In a real app, this would call the API
      // await fetch(`/api/listings/${params.id}`, { method: 'DELETE' })
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      router.push('/provider/listings')
    } catch (err) {
      setError('Gagal menghapus listing')
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
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <Link href="/provider/listings" className="text-primary hover:underline text-sm mb-2 inline-flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Kembali
              </Link>
              <h1 className="text-2xl font-bold text-text-primary">Edit Listing</h1>
              <p className="text-text-secondary">Perbarui informasi jasa atau produk Anda</p>
            </div>

            <form onSubmit={handleSubmit}>
              <Card>
                <CardHeader>
                  <CardTitle>Informasi Listing</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-md text-green-600 text-sm">
                      {success}
                    </div>
                  )}

                  <Input
                    label="Judul Listing"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Contoh: Jasa Service AC Profesional"
                    required
                  />

                  <Textarea
                    label="Deskripsi"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Jelaskan secara detail tentang jasa atau produk Anda..."
                    required
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select
                      label="Kategori"
                      name="categoryId"
                      value={formData.categoryId}
                      onChange={handleChange}
                      options={categories}
                      required
                    />

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Lokasi <span className="text-red-500">*</span>
                      </label>
                      <LocationAutocomplete
                        value={formData.location}
                        onChange={(value) => setFormData(prev => ({ ...prev, location: value }))}
                        placeholder="Ketik nama desa..."
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Harga"
                      name="price"
                      type="number"
                      value={formData.price}
                      onChange={handleChange}
                      placeholder="Contoh: 150000"
                      required
                    />

                    <Select
                      label="Tipe Harga"
                      name="priceType"
                      value={formData.priceType}
                      onChange={handleChange}
                      options={[
                        { label: 'Harga Tetap', value: 'FIXED' },
                        { label: 'Nego', value: 'NEGOTIABLE' },
                        { label: 'Mulai dari', value: 'STARTING_FROM' },
                      ]}
                    />
                  </div>

                  <Input
                    label="Nomor WhatsApp"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="6281234567890"
                    required
                  />

                  <Select
                    label="Status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    options={[
                      { label: 'Aktif', value: 'ACTIVE' },
                      { label: 'Nonaktif', value: 'INACTIVE' },
                    ]}
                  />

                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                    {imagePreview ? (
                      <div className="relative">
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          className="max-h-48 mx-auto rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setImageFile(null)
                            setImagePreview(null)
                          }}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <>
                        <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-text-secondary mb-2">Ganti foto produk/jasa</p>
                        <p className="text-xs text-text-secondary">Format: JPG, PNG (max 5MB)</p>
                      </>
                    )}
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="mt-4 block w-full text-sm text-text-secondary
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-primary/10 file:text-primary
                        hover:file:bg-primary/20"
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button type="submit" disabled={saving} className="flex-1">
                      {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </Button>
                    <Link href="/provider/listings">
                      <Button type="button" variant="outline">Batal</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Delete Section */}
              <Card className="mt-6 border-red-200">
                <CardHeader>
                  <CardTitle className="text-red-600">Hapus Listing</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-text-secondary text-sm mb-4">
                    Tindakan ini tidak dapat dibatalkan. Listing akan dihapus secara permanen.
                  </p>
                  <Button 
                    type="button" 
                    variant="destructive" 
                    onClick={handleDelete}
                    disabled={loading}
                  >
                    {loading ? 'Menghapus...' : 'Hapus Listing'}
                  </Button>
                </CardContent>
              </Card>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
