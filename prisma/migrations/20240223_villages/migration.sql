-- Migration: Add Village (Desa) table for Sabu Raijua Regency
-- This migration adds the Village table to an existing database for Neon PostgreSQL
-- Run this SQL in your Neon database query editor

-- Create Village table
CREATE TABLE "Village" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "name" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "description" TEXT,
    "population" INTEGER,
    "area" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Add sample villages for Sabu Raijua Regency
INSERT INTO "Village" ("name", "district", "description", "population", "area", "isActive", "order") VALUES
-- Kecamatan Rai Manuk
('Desa Raha', 'Kecamatan Rai Manuk', 'Ibukota Kecamatan Rai Manuk', 2500, '25.5', true, 1),
('Desa Laudah', 'Kecamatan Rai Manuk', 'Desa seluas 30 km²', 1800, '30.0', true, 2),
('Desa Eahun', 'Kecamatan Rai Manuk', 'Desa dengan potensi pertanian', 1200, '18.5', true, 3),
('Desa Maleko', 'Kecamatan Rai Manuk', 'Desa pegunungan', 950, '22.0', true, 4),
-- Kecamatan Sabu Barat
('Desa Seba', 'Kecamatan Sabu Barat', 'Ibukota Kecamatan Sabu Barat', 3200, '28.0', true, 5),
('Desa Akle', 'Kecamatan Sabu Barat', 'Desa coastal', 2100, '15.5', true, 6),
('Desa B.packages', 'Kecamatan Sabu Barat', 'Desa dengan pantai indah', 1650, '20.0', true, 7),
-- Kecamatan Sabu Timur
('Desa Liae', 'Kecamatan Sabu Timur', 'Ibukota Kecamatan Sabu Timur', 2800, '26.0', true, 8),
('Desa Mego', 'Kecamatan Sabu Timur', 'Desa agriculture', 1900, '24.5', true, 9),
('Desa Jorubha', 'Kecamatan Sabu Timur', 'Desa tradisional', 1450, '19.0', true, 10),
-- Kecamatan Sabu Tengah
('Desa Mbotutoha', 'Kecamatan Sabu Tengah', 'Ibukota Kecamatan Sabu Tengah', 2650, '27.5', true, 11),
('Desa Ledea', 'Kecamatan Sabu Tengah', 'Desa dengan hutan', 1100, '35.0', true, 12),
('Desa Kuru', 'Kecamatan Sabu Tengah', 'Desa pegunungan', 890, '21.5', true, 13),
-- Kecamatan Hawu Mehara
('Desa Hawu Mehara', 'Kecamatan Hawu Mehara', 'Ibukota Kecamatan Hawu Mehara', 2200, '23.0', true, 14),
('Desa Bintang', 'Kecamatan Hawu Mehara', 'Desa pesona', 1750, '18.0', true, 15),
('Desa Pala', 'Kecamatan Hawu Mehara', 'Desa rempah', 1300, '16.5', true, 16);

-- Note: If gen_random_uuid() doesn't work, you can use a different approach
-- Or simply let the application create IDs when adding new villages through the admin panel
