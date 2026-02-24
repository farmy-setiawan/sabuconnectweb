'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { PRICE_TYPES } from '@/lib/constants'
import type { Category } from '@/types'

interface Village {
  id: string
  name: string
  district: string
}

interface SearchFiltersProps {
  categories: Category[]
}

export function SearchFilters({ categories }: SearchFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState(searchParams.get('q') || '')
  const [type, setType] = useState(searchParams.get('type') || '')
  const [categoryId, setCategoryId] = useState(searchParams.get('categoryId') || '')
  const [location, setLocation] = useState(searchParams.get('location') || '')
  const [village, setVillage] = useState(searchParams.get('village') || '')
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '')
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '')
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'newest')
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

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (search) params.set('q', search)
    if (type) params.set('type', type)
    if (categoryId) params.set('categoryId', categoryId)
    if (location) params.set('location', location)
    if (village) params.set('village', village)
    if (minPrice) params.set('minPrice', minPrice)
    if (maxPrice) params.set('maxPrice', maxPrice)
    if (sortBy) params.set('sortBy', sortBy)

    router.push(`/search?${params.toString()}`)
  }

  const handleClear = () => {
    setSearch('')
    setType('')
    setCategoryId('')
    setLocation('')
    setVillage('')
    setMinPrice('')
    setMaxPrice('')
    setSortBy('newest')
    router.push('/search')
  }

  const typeOptions = [
    { label: 'Semua Tipe', value: '' },
    { label: 'Jasa', value: 'JASA' },
    { label: 'Produk', value: 'PRODUK' },
  ]

  const categoryOptions = [
    { label: 'Semua Kategori', value: '' },
    ...categories.map((cat) => ({ label: cat.name, value: cat.id })),
  ]

  const locationOptions = [
    { label: 'Semua Lokasi', value: '' },
    ...villages.map(v => ({
      label: `${v.name} (${v.district})`,
      value: `${v.name}, ${v.district}`
    }))
  ]

  const sortOptions = [
    { label: 'Terbaru', value: 'newest' },
    { label: 'Harga: Rendah ke Tinggi', value: 'price_asc' },
    { label: 'Harga: Tinggi ke Rendah', value: 'price_desc' },
    { label: 'Terpopuler', value: 'popular' },
  ]

  return (
    <div className="space-y-4">
      {/* Search */}
      <Input
        placeholder="Cari..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
      />

      {/* Type */}
      <Select
        label="Tipe"
        value={type}
        onChange={(e) => setType(e.target.value)}
        options={typeOptions}
      />

      {/* Category */}
      {type && (
        <Select
          label="Kategori"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          options={categoryOptions}
        />
      )}

      {/* Location */}
      <Select
        label="Lokasi"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        options={locationOptions}
      />

      {/* Price Range */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-text-primary">Rentang Harga</label>
        <div className="flex gap-2">
          <Input
            placeholder="Min"
            type="number"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
          />
          <Input
            placeholder="Max"
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />
        </div>
      </div>

      {/* Sort */}
      <Select
        label="Urutkan"
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
        options={sortOptions}
      />

      {/* Buttons */}
      <div className="flex gap-2 pt-2">
        <Button onClick={handleSearch} className="flex-1">
          Filter
        </Button>
        <Button variant="outline" onClick={handleClear}>
          Reset
        </Button>
      </div>
    </div>
  )
}
