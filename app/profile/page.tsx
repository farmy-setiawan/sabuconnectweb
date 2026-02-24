'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { BottomNav } from '@/components/layout/BottomNav'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function ProfilePage() {
  const { data: session, status, update } = useSession()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: session?.user?.name || '',
    email: session?.user?.email || '',
    phone: '6281234567890',
  })

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-text-primary mb-4">Login Required</h2>
          <p className="text-text-secondary mb-4">Silakan login untuk melihat profil</p>
          <Link href="/login">
            <Button>Masuk</Button>
          </Link>
        </div>
      </div>
    )
  }

  const handleSave = () => {
    // Save logic would go here
    setIsEditing(false)
  }

  return (
    <div className="min-h-screen flex flex-col bg-background pb-16 md:pb-0">
      <Header />

      <main className="flex-1 pb-16 md:pb-0">
        <div className="container-app py-8">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-text-primary">Pengaturan Profil</h1>
              <p className="text-text-secondary">Kelola informasi akun Anda</p>
            </div>

            {/* Profile Card */}
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Informasi Akun</CardTitle>
                  <Button
                    variant={isEditing ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                  >
                    {isEditing ? 'Simpan' : 'Edit'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar */}
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-3xl font-bold text-primary">
                      {session.user?.name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-text-primary">{session.user?.name}</p>
                    <p className="text-sm text-text-secondary capitalize">{session.user?.role?.toLowerCase()}</p>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-4">
                  <Input
                    label="Nama Lengkap"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={!isEditing}
                  />
                  
                  <Input
                    label="Email"
                    type="email"
                    value={formData.email}
                    disabled
                  />
                  <p className="text-xs text-text-secondary">Email tidak dapat diubah</p>

                  <Input
                    label="Nomor WhatsApp"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Role Card */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Role Akun</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-text-primary capitalize">{session.user?.role?.toLowerCase()}</p>
                    <p className="text-sm text-text-secondary">
                      {session.user?.role === 'ADMIN' && 'Akses penuh untuk mengelola platform'}
                      {session.user?.role === 'PROVIDER' && 'Dapat membuat dan mengelola listing'}
                      {session.user?.role === 'USER' && 'Dapat menjelajahi dan membuat transaksi'}
                    </p>
                  </div>
                  {session.user?.role === 'USER' && (
                    <Link href="/register?role=provider">
                      <Button variant="outline" size="sm">
                        Upgrade ke Provider
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Security */}
            <Card>
              <CardHeader>
                <CardTitle>Keamanan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-text-primary">Password</p>
                    <p className="text-sm text-text-secondary">Ubah password akun Anda</p>
                  </div>
                  <Button variant="outline" size="sm">Ubah Password</Button>
                </div>
                
                <div className="pt-4 border-t border-border">
                  <Button variant="ghost" className="text-red-500 hover:text-red-600">
                    Keluar dari akun
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <div className="hidden md:block">
        <Footer />
      </div>
      <BottomNav />
    </div>
  )
}
