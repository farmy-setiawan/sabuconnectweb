'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'

interface ListingActionsProps {
  listingId: string
}

export function ListingActions({ listingId }: ListingActionsProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/provider/listings/${listingId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        router.refresh()
      } else {
        const data = await res.json()
        alert(data.error || 'Gagal menghapus listing')
      }
    } catch (error) {
      console.error('Error deleting listing:', error)
      alert('Terjadi kesalahan saat menghapus listing')
    } finally {
      setIsDeleting(false)
      setShowConfirm(false)
    }
  }

  if (showConfirm) {
    return (
      <div className="flex gap-2 items-center">
        <span className="text-xs text-red-600 font-medium">Hapus?</span>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDelete}
          disabled={isDeleting}
          className="text-red-600 border-red-200 hover:bg-red-50"
        >
          {isDeleting ? '...' : 'Ya'}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowConfirm(false)}
          disabled={isDeleting}
        >
          Batal
        </Button>
      </div>
    )
  }

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowConfirm(true)}
        className="text-red-600 border-red-200 hover:bg-red-50"
      >
        Hapus
      </Button>
    </div>
  )
}
