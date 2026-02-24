-- ============================================
-- SABUConnect Database Seed for Neon PostgreSQL
-- ============================================

-- IMPORTANT: Before running, make sure you have created the database schema
-- Run: npx prisma db push  (with your Neon DATABASE_URL)

-- ============================================
-- USERS
-- ============================================

-- Admin User (email: admin@sabuconnect.id, password: admin123)
INSERT INTO "User" (id, email, password, name, phone, role, "isVerified", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid()::text,
  'admin@sabuconnect.id',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.G0r.Y6ByhJQG2',
  'Administrator',
  '6281234567890',
  'ADMIN',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password;

-- Provider User (email: provider@sabuconnect.id, password: provider123)
INSERT INTO "User" (id, email, password, name, phone, role, "isVerified", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid()::text,
  'provider@sabuconnect.id',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.G0r.Y6ByhJQG2',
  'Toko Sabu',
  '6289876543210',
  'PROVIDER',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password;

-- Regular User (email: user@sabuconnect.id, password: user123)
INSERT INTO "User" (id, email, password, name, phone, role, "isVerified", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid()::text,
  'user@sabuconnect.id',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.G0r.Y6ByhJQG2',
  'Ahmad Wijaya',
  '6285123456789',
  'USER',
  false,
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password;

-- ============================================
-- CATEGORIES - JASA
-- ============================================

INSERT INTO "Category" (id, name, slug, type, "createdAt", "updatedAt") VALUES
(gen_random_uuid()::text, 'Konstruksi & Bangunan', 'konstruksi-bangunan', 'JASA', NOW(), NOW()),
(gen_random_uuid()::text, 'Reparasi & Montir', 'reparasi-montir', 'JASA', NOW(), NOW()),
(gen_random_uuid()::text, 'Servis Elektronik', 'servis-elektronik', 'JASA', NOW(), NOW()),
(gen_random_uuid()::text, 'Salon & Kecantikan', 'salon-kecantikan', 'JASA', NOW(), NOW()),
(gen_random_uuid()::text, 'Pendidikan & Les Privat', 'pendidikan-les-privat', 'JASA', NOW(), NOW()),
(gen_random_uuid()::text, 'Kesehatan & Fitness', 'kesehatan-fitness', 'JASA', NOW(), NOW()),
(gen_random_uuid()::text, 'Transportasi', 'transportasi', 'JASA', NOW(), NOW()),
(gen_random_uuid()::text, 'Layanan Rumah Tangga', 'layanan-rumah-tangga', 'JASA', NOW(), NOW()),
(gen_random_uuid()::text, 'Fotografi & Videografi', 'fotografi-videografi', 'JASA', NOW(), NOW()),
(gen_random_uuid()::text, 'Jasa Lainnya', 'jasa-lainnya', 'JASA', NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- CATEGORIES - PRODUK
-- ============================================

INSERT INTO "Category" (id, name, slug, type, "createdAt", "updatedAt") VALUES
(gen_random_uuid()::text, 'Hasil Pertanian', 'hasil-pertanian', 'PRODUK', NOW(), NOW()),
(gen_random_uuid()::text, 'Hasil Laut & Perikan', 'hasil-laut-perikan', 'PRODUK', NOW(), NOW()),
(gen_random_uuid()::text, 'Kerajinan Tangan', 'kerajinan-tangan', 'PRODUK', NOW(), NOW()),
(gen_random_uuid()::text, 'Makanan & Minuman', 'makanan-minuman', 'PRODUK', NOW(), NOW()),
(gen_random_uuid()::text, 'Pakaian & Tekstil', 'pakaian-tekstil', 'PRODUK', NOW(), NOW()),
(gen_random_uuid()::text, 'Tanaman & Bibit', 'tanaman-bibit', 'PRODUK', NOW(), NOW()),
(gen_random_uuid()::text, 'Ternak & Peternakan', 'ternak-peternakan', 'PRODUK', NOW(), NOW()),
(gen_random_uuid()::text, 'Produk Lainnya', 'produk-lainnya', 'PRODUK', NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- PROMO BANNERS
-- ============================================

INSERT INTO "PromoBanner" (id, title, subtitle, image, link, position, "isActive", "order", "startDate", "endDate", "createdAt", "updatedAt") VALUES
(gen_random_uuid()::text, 'Selamat Datang di SABUConnect', 'Platform Layanan & Ekonomi Digital Sabu Raijua', 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&h=400&fit=crop', '/search', 'hero', true, 1, NULL, NULL, NOW(), NOW()),
(gen_random_uuid()::text, 'Promo Produk Lokal', 'Dukung produk asli Sabu Raijua', 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=1200&h=400&fit=crop', '/search?type=PRODUK', 'hero', true, 2, NULL, NULL, NOW(), NOW()),
(gen_random_uuid()::text, 'Jasa Terpercaya', 'Temukan jasa profesional di sekitar Anda', 'https://images.unsplash.com/photo-1581578731117-e0a820139a29?w=1200&h=400&fit=crop', '/search?type=JASA', 'hero', true, 3, NULL, NULL, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- VERIFY DATA
-- ============================================

SELECT 'Users created:' as info, COUNT(*) as total FROM "User";
SELECT 'Categories created:' as info, COUNT(*) as total FROM "Category";
SELECT 'Promo Banners created:' as info, COUNT(*) as total FROM "PromoBanner";
