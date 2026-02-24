import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create default admin
  const hashedPassword = await bcrypt.hash('admin123', 12)
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@sabuconnect.id' },
    update: {},
    create: {
      email: 'admin@sabuconnect.id',
      name: 'Administrator',
      phone: '6281234567890',
      password: hashedPassword,
      role: 'ADMIN',
      isVerified: true,
    },
  })
  console.log('Created admin:', admin.email)

  // Create default provider
  const providerPassword = await bcrypt.hash('provider123', 12)
  const provider = await prisma.user.upsert({
    where: { email: 'provider@sabuconnect.id' },
    update: {},
    create: {
      email: 'provider@sabuconnect.id',
      name: 'Toko Sabu',
      phone: '6289876543210',
      password: providerPassword,
      role: 'PROVIDER',
      isVerified: true,
    },
  })
  console.log('Created provider:', provider.email)

  // Create demo user (masyarakat)
  const userPassword = await bcrypt.hash('user123', 12)
  const user = await prisma.user.upsert({
    where: { email: 'user@sabuconnect.id' },
    update: {},
    create: {
      email: 'user@sabuconnect.id',
      name: 'Ahmad Wijaya',
      phone: '6285123456789',
      password: userPassword,
      role: 'USER',
      isVerified: false,
    },
  })
  console.log('Created user:', user.email)

  // Create default categories
  const jasaCategories: { name: string; slug: string; type: 'JASA' | 'PRODUK' }[] = [
    { name: 'Konstruksi & Bangunan', slug: 'konstruksi-bangunan', type: 'JASA' },
    { name: 'Reparasi & Montir', slug: 'reparasi-montir', type: 'JASA' },
    { name: 'Servis Elektronik', slug: 'servis-elektronik', type: 'JASA' },
    { name: 'Salon & Kecantikan', slug: 'salon-kecantikan', type: 'JASA' },
    { name: 'Pendidikan & Les Privat', slug: 'pendidikan-les-privat', type: 'JASA' },
    { name: 'Kesehatan & Fitness', slug: 'kesehatan-fitness', type: 'JASA' },
    { name: 'Transportasi', slug: 'transportasi', type: 'JASA' },
    { name: 'Layanan Rumah Tangga', slug: 'layanan-rumah-tangga', type: 'JASA' },
    { name: 'Fotografi & Videografi', slug: 'fotografi-videografi', type: 'JASA' },
    { name: 'Jasa Lainnya', slug: 'jasa-lainnya', type: 'JASA' },
  ]

  const produkCategories: { name: string; slug: string; type: 'JASA' | 'PRODUK' }[] = [
    { name: 'Hasil Pertanian', slug: 'hasil-pertanian', type: 'PRODUK' },
    { name: 'Hasil Laut & Perikan', slug: 'hasil-laut-perikan', type: 'PRODUK' },
    { name: 'Kerajinan Tangan', slug: 'kerajinan-tangan', type: 'PRODUK' },
    { name: 'Makanan & Minuman', slug: 'makanan-minuman', type: 'PRODUK' },
    { name: 'Pakaian & Tekstil', slug: 'pakaian-tekstil', type: 'PRODUK' },
    { name: 'Tanaman & Bibit', slug: 'tanaman-bibit', type: 'PRODUK' },
    { name: 'Ternak & Peternakan', slug: 'ternak-peternakan', type: 'PRODUK' },
    { name: 'Produk Lainnya', slug: 'produk-lainnya', type: 'PRODUK' },
  ]

  for (const cat of jasaCategories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    })
  }

  for (const cat of produkCategories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    })
  }

  console.log('Created categories')

  // Get a category for the sample listing
  const category = await prisma.category.findFirst({
    where: { type: 'PRODUK' },
  })

  const jasaCategory = await prisma.category.findFirst({
    where: { type: 'JASA' },
  })

  if (category && provider) {
    // Create sample product listing
    await prisma.listing.upsert({
      where: { slug: 'kelapa-bali-sabu-raijua' },
      update: {},
      create: {
        title: 'Kelapa Bali Kualitas Premium',
        slug: 'kelapa-bali-sabu-raijua',
        description: 'Kelapa bali segar langsung dari petani Sabu Raijua. Kualitas premium, cocok untuk kopra, minyak kelapa, atau konsumsi langsung. Harga terjangkau dari petani lokal.',
        price: 15000,
        priceType: 'FIXED',
        images: [],
        location: 'Kota Waikabubak',
        phone: '6289876543210',
        categoryId: category.id,
        userId: provider.id,
        status: 'ACTIVE',
        isFeatured: true,
      },
    })
    console.log('Created sample product listing')
  }

  if (jasaCategory && provider) {
    // Create sample service listing
    await prisma.listing.upsert({
      where: { slug: 'jasa-bangun-rumah' },
      update: {},
      create: {
        title: 'Jasa Bangun Rumah & Renovasi',
        slug: 'jasa-bangun-rumah',
        description: 'Jasa pembangunan rumah, renovasi, dan perbaikan bangunan. Tim berpengalaman membangun rumah di seluruh wilayah Sabu Raijua. Gratis konsultasi dan survey lokasi.',
        price: 500000,
        priceType: 'STARTING_FROM',
        images: [],
        location: 'Kota Waikabubak',
        phone: '6289876543210',
        categoryId: jasaCategory.id,
        userId: provider.id,
        status: 'ACTIVE',
        isFeatured: true,
      },
    })
    console.log('Created sample service listing')
  }

  // Create demo promo banners
  const demoBanners = [
    {
      title: 'Selamat Datang di SABUConnect',
      subtitle: 'Platform Layanan & Ekonomi Digital Sabu Raijua',
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&h=400&fit=crop',
      link: '/search',
      position: 'hero',
      isActive: true,
      order: 1,
    },
    {
      title: 'Promo Produk Lokal',
      subtitle: 'Dukung produk asli Sabu Raijua',
      image: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=1200&h=400&fit=crop',
      link: '/search?type=PRODUK',
      position: 'hero',
      isActive: true,
      order: 2,
    },
    {
      title: 'Jasa Terpercaya',
      subtitle: 'Temukan jasa profesional di sekitar Anda',
      image: 'https://images.unsplash.com/photo-1581578731117-e0a820139a29?w=1200&h=400&fit=crop',
      link: '/search?type=JASA',
      position: 'hero',
      isActive: true,
      order: 3,
    },
  ]

  for (const banner of demoBanners) {
    await prisma.promoBanner.upsert({
      where: { id: banner.title.slice(0, 20) },
      update: {},
      create: banner,
    })
  }
  console.log('Created demo promo banners')

  console.log('')
  console.log('========================================')
  console.log('Seeding completed!')
  console.log('========================================')
  console.log('')
  console.log('Login credentials:')
  console.log('---------------------------------------')
  console.log('Admin:   admin@sabuconnect.id    / admin123')
  console.log('Provider: provider@sabuconnect.id / provider123')
  console.log('User:    user@sabuconnect.id    / user123')
  console.log('========================================')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
