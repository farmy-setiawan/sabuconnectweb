import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma/prisma'

export const dynamic = 'force-dynamic'
export const revalidate = 3600 // Cache for 1 hour

export async function GET() {
  try {
    let settings = await prisma.siteSettings.findUnique({
      where: { id: 'site_settings' },
    })

    // Return default if not exists
    if (!settings) {
      return NextResponse.json({
        id: 'site_settings',
        logo: null,
        siteName: 'SABUConnect',
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching site settings:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil pengaturan' },
      { status: 500 }
    )
  }
}
