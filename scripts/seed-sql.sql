-- SQL for Neon Database Import
-- Run this in Neon PostgreSQL console

-- Create Users
INSERT INTO "User" (id, email, password, name, phone, role, "isVerified", "createdAt", "updatedAt") VALUES
('admin001', 'admin@sabuconnect.id', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.G0r.Y6ByhJQG2', 'Administrator', '6281234567890', 'ADMIN', true, NOW(), NOW())
ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password, name = EXCLUDED.name
RETURNING id;

INSERT INTO "User" (id, email, password, name, phone, role, "isVerified", "createdAt", "updatedAt") VALUES
('provider001', 'provider@sabuconnect.id', '$2a$12$KIXrVzOH7plg7X5.hxYmuOXgE0R0z.IwLVBOQ0Zq5Z5x5x5x5x5x', 'Toko Sabu', '6289876543210', 'PROVIDER', true, NOW(), NOW())
ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password, name = EXCLUDED.name
RETURNING id;

INSERT INTO "User" (id, email, password, name, phone, role, "isVerified", "createdAt", "updatedAt") VALUES
('user001', 'user@sabuconnect.id', '$2a$12$XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', 'Ahmad Wijaya', '6285123456789', 'USER', false, NOW(), NOW())
ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password, name = EXCLUDED.name
RETURNING id;

-- Create Categories - JASA
INSERT INTO "Category" (id, name, slug, type, "createdAt", "updatedAt") VALUES
('cat001', 'Konstruksi & Bangunan', 'konstruksi-bangunan', 'JASA', NOW(), NOW()),
('cat002', 'Reparasi & Montir', 'reparasi-montir', 'JASA', NOW(), NOW()),
('cat003', 'Servis Elektronik', 'servis-elektronik', 'JASA', NOW(), NOW()),
('cat004', 'Salon & Kecantikan', 'salon-kecantikan', 'JASA', NOW(), NOW()),
('cat005', 'Pendidikan & Les Privat', 'pendidikan-les-privat', 'JASA', NOW(), NOW()),
('cat006', 'Kesehatan & Fitness', 'kesehatan-fitness', 'JASA', NOW(), NOW()),
('cat007', 'Transportasi', 'transportasi', 'JASA', NOW(), NOW()),
('cat008', 'Layanan Rumah Tangga', 'layanan-rumah-tangga', 'JASA', NOW(), NOW()),
('cat009', 'Fotografi & Videografi', 'fotografi-videografi', 'JASA', NOW(), NOW()),
('cat010', 'Jasa Lainnya', 'jasa-lainnya', 'JASA', NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;

-- Create Categories - PRODUK
INSERT INTO "Category" (id, name, slug, type, "createdAt", "updatedAt") VALUES
('cat101', 'Hasil Pertanian', 'hasil-pertanian', 'PRODUK', NOW(), NOW()),
('cat102', 'Hasil Laut & Perikan', 'hasil-laut-perikan', 'PRODUK', NOW(), NOW()),
('cat103', 'Kerajinan Tangan', 'kerajinan-tangan', 'PRODUK', NOW(), NOW()),
('cat104', 'Makanan & Minuman', 'makanan-minuman', 'PRODUK', NOW(), NOW()),
('cat105', 'Pakaian & Tekstil', 'pakaian-tekstil', 'PRODUK', NOW(), NOW()),
('cat106', 'Tanaman & Bibit', 'tanaman-bibit', 'PRODUK', NOW(), NOW()),
('cat107', 'Ternak & Peternakan', 'ternak-peternakan', 'PRODUK', NOW(), NOW()),
('cat108', 'Produk Lainnya', 'produk-lainnya', 'PRODUK', NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;

-- Create Promo Banners
INSERT INTO "PromoBanner" (id, title, subtitle, image, link, position, "isActive", "order", "startDate", "endDate", "createdAt", "updatedAt") VALUES
('banner001', 'Selamat Datang di SABUConnect', 'Platform Layanan & Ekonomi Digital Sabu Raijua', 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&h=400&fit=crop', '/search', 'hero', true, 1, NULL, NULL, NOW(), NOW()),
('banner002', 'Promo Produk Lokal', 'Dukung produk asli Sabu Raijua', 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=1200&h=400&fit=crop', '/search?type=PRODUK', 'hero', true, 2, NULL, NULL, NOW(), NOW()),
('banner003', 'Jasa Terpercaya', 'Temukan jasa profesional di sekitar Anda', 'https://images.unsplash.com/photo-1581578731117-e0a820139a29?w=1200&h=400&fit=crop', '/search?type=JASA', 'hero', true, 3, NULL, NULL, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Note: Passwords above are placeholders. Run the seed via npm for actual hashed passwords.
