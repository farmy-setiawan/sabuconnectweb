import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma/prisma'

// Get site settings
export async function GET() {
  try {
    let settings = await prisma.siteSettings.findUnique({
      where: { id: 'site_settings' },
    })

    // Create default settings if not exists
    if (!settings) {
      settings = await prisma.siteSettings.create({
        data: {
          id: 'site_settings',
          siteName: 'SABUConnect',
        },
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

// Update site settings (admin only)
export async function PUT(request: Request) {
  try {
    const session = await auth()
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { logo, siteName } = body

    const settings = await prisma.siteSettings.upsert({
      where: { id: 'site_settings' },
      update: {
        ...(logo !== undefined && { logo }),
        ...(siteName !== undefined && { siteName }),
      },
      create: {
        id: 'site_settings',
        logo,
        siteName: siteName || 'SABUConnect',
      },
    })

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error updating site settings:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengupdate pengaturan' },
      { status: 500 }
    )
  }
}
