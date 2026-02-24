'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'

interface ListingActionsProps {
  listingId: string
  currentStatus: string
  onUpdate?: () => void
}

export function ListingActions({ listingId, currentStatus, onUpdate }: ListingActionsProps) {
  const [loading, setLoading] = useState<string | null>(null)

  const handleStatusUpdate = async (newStatus: string) => {
    setLoading(newStatus)
    
    try {
      const response = await fetch(`/api/admin/listings/${listingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        // Trigger refresh
        if (onUpdate) {
          onUpdate()
        } else {
          window.location.reload()
        }
      } else {
        const data = await response.json()
        alert(data.error || 'Gagal memperbarui status')
      }
    } catch (error) {
      console.error('Error updating listing status:', error)
      alert('Terjadi kesalahan saat memperbarui status')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="flex gap-1">
      {currentStatus === 'PENDING' && (
        <>
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleStatusUpdate('ACTIVE')}
            disabled={loading === 'ACTIVE'}
            className="text-xs px-2 py-1"
          >
            {loading === 'ACTIVE' ? '...' : 'Terima'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleStatusUpdate('REJECTED')}
            disabled={loading === 'REJECTED'}
            className="text-xs px-2 py-1 text-red-600 border-red-600 hover:bg-red-50"
          >
            {loading === 'REJECTED' ? '...' : 'Tolak'}
          </Button>
        </>
      )}
      
      {currentStatus === 'REJECTED' && (
        <Button
          variant="primary"
          size="sm"
          onClick={() => handleStatusUpdate('ACTIVE')}
          disabled={loading === 'ACTIVE'}
          className="text-xs px-2 py-1"
        >
          {loading === 'ACTIVE' ? '...' : 'Aktifkan'}
        </Button>
      )}
      
      {currentStatus === 'ACTIVE' && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleStatusUpdate('INACTIVE')}
          disabled={loading === 'INACTIVE'}
          className="text-xs px-2 py-1"
        >
          {loading === 'INACTIVE' ? '...' : 'Nonaktifkan'}
        </Button>
      )}
      
      {currentStatus === 'INACTIVE' && (
        <Button
          variant="primary"
          size="sm"
          onClick={() => handleStatusUpdate('ACTIVE')}
          disabled={loading === 'ACTIVE'}
          className="text-xs px-2 py-1"
        >
          {loading === 'ACTIVE' ? '...' : 'Aktifkan'}
        </Button>
      )}
    </div>
  )
}
