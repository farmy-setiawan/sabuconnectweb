'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

interface SiteSettings {
  logo: string | null
  siteName: string
}

export function Header() {
  const { data: session, status } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({ logo: null, siteName: 'SABUConnect' })
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    fetchSiteSettings()
  }, [])

  const fetchSiteSettings = async () => {
    try {
      const res = await fetch('/api/site-settings')
      if (res.ok) {
        const data = await res.json()
        setSiteSettings(data)
      }
    } catch (error) {
      console.error('Error fetching site settings:', error)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
    } else {
      router.push('/search?q=')
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="container-app">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            {siteSettings.logo ? (
              <img src={siteSettings.logo} alt={siteSettings.siteName} className="w-9 h-9 object-contain rounded-lg" />
            ) : (
              <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
            )}
            <span className="text-lg font-bold text-primary hidden sm:block">{siteSettings.siteName}</span>
          </Link>

          {/* Search Bar - Centered */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Cari jasa atau produk..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-4 pr-12 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              />
              <button
                type="submit"
                className="absolute right-1 top-1 h-8 w-10 bg-primary rounded-full text-white flex items-center justify-center hover:bg-primary-dark transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </form>

          {/* Right Icons */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Notification Icon - Only visible when authenticated */}
            {status === 'authenticated' && session && (
              <Link
                href="/dashboard"
                className="hidden md:flex items-center justify-center w-10 h-10 text-gray-500 hover:text-primary hover:bg-primary/5 rounded-full transition-colors relative"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </Link>
            )}

            {/* Profile Icon or Auth */}
            {status === 'loading' || !mounted ? (
              <div className="w-10 h-10 bg-gray-100 animate-pulse rounded-full" />
            ) : session ? (
              <div className="flex items-center gap-3">
                <Link
                  href={session.user.role === 'PROVIDER' ? '/provider' : session.user.role === 'ADMIN' ? '/admin' : '/dashboard'}
                  className="hidden md:flex items-center justify-center w-10 h-10 text-gray-500 hover:text-primary hover:bg-primary/5 rounded-full transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </Link>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="hidden md:block"
                >
                  Keluar
                </Button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">Masuk</Button>
                </Link>
                <Link href="/register">
                  <Button variant="primary" size="sm">Daftar</Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-gray-500 hover:text-primary"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 animate-slide-down">
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Cari jasa atau produk..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 pl-4 pr-12 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
                <button type="submit" className="absolute right-1 top-1 h-8 w-10 bg-primary rounded-full text-white flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </form>
            <nav className="flex flex-col gap-2">
              <Link href="/search?q=" className="text-gray-600 hover:text-primary py-2" onClick={() => setMobileMenuOpen(false)}>
                Jelajahi
              </Link>
              <Link href="/search?type=JASA" className="text-gray-600 hover:text-primary py-2" onClick={() => setMobileMenuOpen(false)}>
                Jasa
              </Link>
              <Link href="/search?type=PRODUK" className="text-gray-600 hover:text-primary py-2" onClick={() => setMobileMenuOpen(false)}>
                Produk
              </Link>
              <div className="pt-4 border-t border-gray-100 flex flex-col gap-3">
                {mounted && session ? (
                  <>
                    <Link href={session.user.role === 'PROVIDER' ? '/provider' : session.user.role === 'ADMIN' ? '/admin' : '/dashboard'} onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full">Dashboard</Button>
                    </Link>
                    <Button variant="outline" className="w-full" onClick={() => { signOut({ callbackUrl: '/' }); setMobileMenuOpen(false) }}>
                      Keluar
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full">Masuk</Button>
                    </Link>
                    <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="primary" className="w-full">Daftar</Button>
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
