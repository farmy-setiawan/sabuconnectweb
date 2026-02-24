'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'

interface Village {
  id: string
  name: string
  district: string
}

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

export default function NewListingPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [villages, setVillages] = useState<Village[]>([])
  
  // Fetch villages from database
  useEffect(() => {
    async function fetchVillages() {
      try {
        const res = await fetch('/api/villages')
        const data = await res.json()
        if (data.villages) {
          setVillages(data.villages)
        }
      } catch (error) {
        console.error('Error fetching villages:', error)
      }
    }
    fetchVillages()
  }, [])

  // Build location options from villages
  const locations = [
    { label: 'Pilih Lokasi', value: '' },
    ...villages.map(v => ({
      label: `${v.name} (${v.district})`,
      value: `${v.name}, ${v.district}`
    }))
  ]
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: '',
    price: '',
    priceType: 'FIXED',
    location: '',
    phone: '',
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      // Create preview
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
    setLoading(true)

    try {
      // Validate form data
      if (!formData.title || !formData.description || !formData.price || !formData.location || !formData.phone || !formData.categoryId) {
        setError('Semua field wajib diisi')
        setLoading(false)
        return
      }

      // Convert image to data URL if selected
      let images: string[] = []
      if (imageFile) {
        const reader = new FileReader()
        const imageData = await new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string)
          reader.readAsDataURL(imageFile)
        })
        images = [imageData]
      }

      const response = await fetch('/api/listings', {
        method: 'POST',
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

      router.push('/provider/listings')
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
              <h1 className="text-2xl font-bold text-text-primary">Tambah Listing Baru</h1>
              <p className="text-text-secondary">Tambahkan jasa atau produk Anda</p>
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

                    <Select
                      label="Lokasi"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      options={locations}
                      required
                    />
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
                        <p className="text-text-secondary mb-2">Upload foto produk/jasa</p>
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
                    <Button type="submit" disabled={loading} className="flex-1">
                      {loading ? 'Menyimpan...' : 'Simpan Listing'}
                    </Button>
                    <Link href="/provider/listings">
                      <Button type="button" variant="outline">Batal</Button>
                    </Link>
                  </div>
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
