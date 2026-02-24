'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Input } from '@/components/ui/Input'

interface Village {
  id: string
  name: string
  district: string
}

interface LocationAutocompleteProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
}

export function LocationAutocomplete({ 
  value, 
  onChange, 
  placeholder = 'Cari lokasi desa...', 
  required = false 
}: LocationAutocompleteProps) {
  const [query, setQuery] = useState(value)
  const [suggestions, setSuggestions] = useState<Village[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loading, setLoading] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Filter villages based on query
  const fetchVillages = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setSuggestions([])
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/villages?search=${encodeURIComponent(searchQuery)}`)
      if (res.ok) {
        const data = await res.json()
        setSuggestions(data.villages || [])
      }
    } catch (error) {
      console.error('Error fetching villages:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      fetchVillages(query)
    }, 300)

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [query, fetchVillages])

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (village: Village) => {
    const locationText = `${village.name}, ${village.district}`
    setQuery(locationText)
    onChange(locationText)
    setShowSuggestions(false)
    setSuggestions([])
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setQuery(newValue)
    onChange(newValue)
    setShowSuggestions(true)
  }

  const handleInputFocus = () => {
    if (query.length >= 2) {
      setShowSuggestions(true)
    }
  }

  return (
    <div ref={wrapperRef} className="relative">
      <Input
        type="text"
        value={query}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        placeholder={placeholder}
        required={required}
        autoComplete="off"
        className="w-full"
      />
      
      {showSuggestions && (query.length >= 2) && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
          {loading ? (
            <div className="p-3 text-center text-gray-500">
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                <span>Mencari...</span>
              </div>
            </div>
          ) : suggestions.length > 0 ? (
            <ul className="py-1">
              {suggestions.map((village) => (
                <li key={village.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(village)}
                    className="w-full px-4 py-3 text-left hover:bg-green-50 transition-colors flex items-center justify-between group"
                  >
                    <div>
                      <span className="font-medium text-gray-900 group-hover:text-green-700">
                        {village.name}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 group-hover:text-green-600">
                      {village.district}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-3 text-center text-gray-500 text-sm">
              Tidak ada desa yang ditemukan
            </div>
          )}
        </div>
      )}
      
      {/* Hint text */}
      <p className="mt-1 text-xs text-gray-500">
        Ketik minimal 2 karakter untuk mencari desa
      </p>
    </div>
  )
}
