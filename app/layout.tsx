import type { Metadata } from 'next'
import { SessionProvider } from 'next-auth/react'
import './globals.css'

export const metadata: Metadata = {
  title: 'SABUConnect - Platform Layanan Terhubung Sabu Raijua',
  description: 'Platform digital untuk menghubungkan masyarakat Kabupaten Sabu Raijua dalam satu ekosistem layanan lokal.',
  keywords: ['Sabu Raijua', 'UMKM', 'Jasa', 'Produk Lokal', 'Marketplace'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-background">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  )
}
