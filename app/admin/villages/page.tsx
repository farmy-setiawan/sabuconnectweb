'use client'

import { useState, useEffect, useCallback } from 'react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'

interface Village {
  id: string
  name: string
  district: string
  description: string | null
  population: number | null
  area: string | null
  isActive: boolean
  order: number
  createdAt: string
  updatedAt: string
}

export default function VillagesPage() {
  const [villages, setVillages] = useState<Village[]>([])
  const [districts, setDistricts] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [districtFilter, setDistrictFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingVillage, setEditingVillage] = useState<Village | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    district: '',
    description: '',
    population: '',
    area: '',
    isActive: true,
    order: 0,
  })

  const fetchVillages = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (districtFilter) params.set('district', districtFilter)
      
      const res = await fetch(`/api/admin/villages?${params}`)
      const data = await res.json()
      setVillages(data.villages || [])
      setDistricts(data.districts || [])
    } catch (error) {
      console.error('Error fetching villages:', error)
    } finally {
      setLoading(false)
    }
  }, [search, districtFilter])

  useEffect(() => {
    fetchVillages()
  }, [fetchVillages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingVillage 
        ? `/api/admin/villages/${editingVillage.id}`
        : '/api/admin/villages'
      
      const method = editingVillage ? 'PUT' : 'POST'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        setShowModal(false)
        setEditingVillage(null)
        setFormData({
          name: '',
          district: '',
          description: '',
          population: '',
          area: '',
          isActive: true,
          order: 0,
        })
        fetchVillages()
      } else {
        const data = await res.json()
        alert(data.error || 'Gagal menyimpan data')
      }
    } catch (error) {
      console.error('Error saving village:', error)
      alert('Gagal menyimpan data')
    }
  }

  const handleEdit = (village: Village) => {
    setEditingVillage(village)
    setFormData({
      name: village.name,
      district: village.district,
      description: village.description || '',
      population: village.population?.toString() || '',
      area: village.area || '',
      isActive: village.isActive,
      order: village.order,
    })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus desa ini?')) return
    
    try {
      const res = await fetch(`/api/admin/villages/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        fetchVillages()
      } else {
        const data = await res.json()
        alert(data.error || 'Gagal menghapus data')
      }
    } catch (error) {
      console.error('Error deleting village:', error)
      alert('Gagal menghapus data')
    }
  }

  const openAddModal = () => {
    setEditingVillage(null)
    setFormData({
      name: '',
      district: '',
      description: '',
      population: '',
      area: '',
      isActive: true,
      order: 0,
    })
    setShowModal(true)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-6 md:py-8">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Kelola Desa</h1>
          <p className="text-gray-600 mt-1">Tambahkan dan kelola data desa di Kabupaten Sabu Raijua</p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Cari desa..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="w-full md:w-48">
                <Select
                  value={districtFilter}
                  onChange={(e) => setDistrictFilter(e.target.value)}
                  options={[
                    { label: 'Semua Kecamatan', value: '' },
                    ...districts.map((d) => ({ label: d, value: d }))
                  ]}
                  className="w-full"
                />
              </div>
              <Button onClick={openAddModal} className="whitespace-nowrap">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Tambah Desa
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Villages List */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Desa ({villages.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#03a21d] mx-auto"></div>
                <p className="mt-2 text-gray-500">Memuat data...</p>
              </div>
            ) : villages.length === 0 ? (
              <div className="text-center py-8">
                <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p className="mt-4 text-gray-500">Belum ada data desa</p>
                <Button onClick={openAddModal} className="mt-4">
                  Tambah Desa Pertama
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">No</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Nama Desa</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Kecamatan</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Populasi</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {villages.map((village, index) => (
                      <tr key={village.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">{index + 1}</td>
                        <td className="py-3 px-4 font-medium">{village.name}</td>
                        <td className="py-3 px-4">{village.district}</td>
                        <td className="py-3 px-4">{village.population?.toLocaleString('id-ID') || '-'}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            village.isActive 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {village.isActive ? 'Aktif' : 'Nonaktif'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => handleEdit(village)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                              title="Edit"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDelete(village.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                              title="Hapus"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>{editingVillage ? 'Edit Desa' : 'Tambah Desa Baru'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Desa *
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Contoh: Desa Raha"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kecamatan *
                  </label>
                  <Input
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    placeholder="Contoh: Kecamatan Rai Manuk"
                    list="districts-list"
                    required
                  />
                  <datalist id="districts-list">
                    {districts.map((d) => (
                      <option key={d} value={d} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deskripsi
                  </label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Deskripsi singkat tentang desa..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Populasi
                    </label>
                    <Input
                      type="number"
                      value={formData.population}
                      onChange={(e) => setFormData({ ...formData, population: e.target.value })}
                      placeholder="Jumlah penduduk"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Luas Wilayah (km²)
                    </label>
                    <Input
                      value={formData.area}
                      onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                      placeholder="Contoh: 25.5"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Urutan Tampilan
                  </label>
                  <Input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-[#03a21d] border-gray-300 rounded focus:ring-[#03a21d]"
                  />
                  <label htmlFor="isActive" className="text-sm text-gray-700">
                    Desa aktif dan dapat ditampilkan
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setShowModal(false)} className="flex-1">
                    Batal
                  </Button>
                  <Button type="submit" className="flex-1">
                    {editingVillage ? 'Simpan Perubahan' : 'Tambah Desa'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      <Footer />
    </div>
  )
}
