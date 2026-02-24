'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'USER',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Password dan konfirmasi password tidak cocok')
      return
    }

    if (formData.password.length < 6) {
      setError('Password minimal 6 karakter')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          role: formData.role,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Terjadi kesalahan saat registrasi')
      }

      router.push('/login?registered=true')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat registrasi')
    } finally {
      setLoading(false)
    }
  }

  const roleOptions = [
    { label: 'Pengguna Biasa', value: 'USER' },
    { label: 'Penyedia Jasa/UMKM', value: 'PROVIDER' },
  ]

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-2xl">S</span>
            </div>
            <span className="text-2xl font-bold text-primary">SABUConnect</span>
          </Link>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Daftar</CardTitle>
            <CardDescription>
              Buat akun baru untuk mengakses SABUConnect
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
                  {error}
                </div>
              )}

              <Input
                label="Nama Lengkap"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Masukkan nama lengkap Anda"
                required
              />

              <Input
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="email@example.com"
                required
              />

              <Input
                label="Nomor WhatsApp"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="81234567890"
                required
              />

              <Select
                label="Daftar Sebagai"
                name="role"
                value={formData.role}
                onChange={handleChange}
                options={roleOptions}
                required
              />

              <Input
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Minimal 6 karakter"
                required
              />

              <Input
                label="Konfirmasi Password"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Masukkan password lagi"
                required
              />

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Memproses...' : 'Daftar'}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <p className="text-text-secondary">
                Sudah punya akun?{' '}
                <Link href="/login" className="text-primary hover:underline font-medium">
                  Masuk
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
