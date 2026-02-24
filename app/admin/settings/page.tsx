'use client'

import { useState, useEffect } from 'react'
import { redirect } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface SiteSettings {
  id: string
  logo: string | null
  siteName: string
}

export default function AdminSettingsPage() {
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [settings, setSettings] = useState<SiteSettings>({
    id: 'site_settings',
    logo: null,
    siteName: 'SABUConnect',
  })
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/login')
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      redirect('/')
    }
  }, [status, session])

  useEffect(() => {
    if (session?.user?.role === 'ADMIN') {
      fetchSettings()
    }
  }, [session])

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/site-settings')
      if (res.ok) {
        const data = await res.json()
        setSettings(data)
        if (data.logo) {
          setLogoPreview(data.logo)
        }
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result as string
        setLogoPreview(base64)
        setSettings({ ...settings, logo: base64 })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSuccess('')

    try {
      const res = await fetch('/api/admin/site-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          logo: settings.logo,
          siteName: settings.siteName,
        }),
      })

      if (res.ok) {
        setSuccess('Pengaturan berhasil disimpan!')
        // Refresh to update header
        setTimeout(() => {
          window.location.reload()
        }, 1500)
      }
    } catch (error) {
      console.error('Error saving settings:', error)
    } finally {
      setSaving(false)
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
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-text-primary">Pengaturan Website</h1>
            <p className="text-text-secondary">Kelola logo dan informasi situs</p>
          </div>

          <form onSubmit={handleSave}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Logo Upload */}
              <Card>
                <CardHeader>
                  <CardTitle>Logo Website</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-center">
                      <div className="w-48 h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden bg-gray-50">
                        {logoPreview ? (
                          <img 
                            src={logoPreview} 
                            alt="Logo Preview" 
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <div className="text-center text-gray-400">
                            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="text-sm">Belum ada logo</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-2">
                        Upload Logo Baru
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoChange}
                        className="w-full px-3 py-2 border border-border rounded-lg"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Format: JPG, PNG, GIF. Ukuran maksimal 2MB
                      </p>
                    </div>

                    {logoPreview && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setLogoPreview(null)
                          setSettings({ ...settings, logo: null })
                        }}
                      >
                        Hapus Logo
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Site Name */}
              <Card>
                <CardHeader>
                  <CardTitle>Informasi Website</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-2">
                        Nama Website
                      </label>
                      <Input
                        value={settings.siteName}
                        onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                        placeholder="SABUConnect"
                      />
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium mb-2">Preview:</h4>
                      <div className="flex items-center gap-2">
                        {logoPreview ? (
                          <img src={logoPreview} alt="Logo" className="w-8 h-8 object-contain" />
                        ) : (
                          <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
                            <span className="text-white text-xs font-bold">S</span>
                          </div>
                        )}
                        <span className="font-semibold text-lg">{settings.siteName}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Save Button */}
            <div className="mt-6 flex items-center gap-4">
              <Button type="submit" disabled={saving}>
                {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>
              {success && (
                <span className="text-green-600 font-medium">{success}</span>
              )}
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  )
}
