export const CATEGORIES = {
  JASA: [
    { name: 'Konstruksi & Bangunan', slug: 'konstruksi-bangunan' },
    { name: 'Reparasi & Montir', slug: 'reparasi-montir' },
    { name: 'Servis Elektronik', slug: 'servis-elektronik' },
    { name: 'Salon & Kecantikan', slug: 'salon-kecantikan' },
    { name: 'Pendidikan & Les Privat', slug: 'pendidikan-les-privat' },
    { name: 'Kesehatan & Fitness', slug: 'kesehatan-fitness' },
    { name: 'Transportasi', slug: 'transportasi' },
    { name: 'Layanan Rumah Tangga', slug: 'layanan-rumah-tangga' },
    { name: 'Fotografi & Videografi', slug: 'fotografi-videografi' },
    { name: 'Lainnya', slug: 'jasa-lainnya' },
  ],
  PRODUK: [
    { name: 'Hasil Pertanian', slug: 'hasil-pertanian' },
    { name: 'Hasil Laut & Perikan', slug: 'hasil-laut-perikan' },
    { name: 'Kerajinan Tangan', slug: 'kerajinan-tangan' },
    { name: 'Makanan & Minuman', slug: 'makanan-minuman' },
    { name: 'Pakaian & Tekstil', slug: 'pakaian-tekstil' },
    { name: 'Tanaman & Bibit', slug: 'tanaman-bibit' },
    { name: 'Ternak & Peternakan', slug: 'ternak-peternakan' },
    { name: 'Lainnya', slug: 'produk-lainnya' },
  ],
}

export const LOCATIONS = [
  'Kota Waikabubak',
  'Kecamatan Kota Waikabubak',
  'Kecamatan Lawa',
  'Kecamatan Malaka',
  'Kecamatan Paga',
  'Kecamatan Rai Manuk',
  'Kecamatan Sawu',
  'Kecamatan Loli',
  'Kecamatan Waiman',
  'Desa Ada',
  'Desa Baha',
  'Desa Biloli',
  'Desa Bokong',
  'Desa Delo',
  'Desa Ea',
  'Desa Halik',
  'Desa Kadubhai',
  'Desa Kawangu',
  'Desa Konda Malaka',
  'Desa Kuatnana',
  'Desa Lainde',
  'Desa Leloboko',
  'Desa Lelowa',
  'Desa Lobholi',
  'Desa Lohayong',
  'Desa Madan',
  'Desa Mnelalete',
  'Desa Nggalak',
  'Desa Olais',
  'Desa Patiala',
  'Desa Raknamo',
  'Desa Rebo',
  'Desa Reroroja',
  'Desa Sbarang',
  'Desa Semana',
  'Desa Sikka',
  'Desa Tafuli',
  'Desa Tena Teke',
  'Desa Tikatuk',
  'Desa Umalulu',
]

export const PRICE_TYPES = [
  { label: 'Harga Tetap', value: 'FIXED' },
  { label: 'Nego', value: 'NEGOTIABLE' },
  { label: 'Mulai dari', value: 'STARTING_FROM' },
]

export const TRANSACTION_STATUSES = [
  { label: 'Menunggu', value: 'PENDING' },
  { label: 'Diterima', value: 'ACCEPTED' },
  { label: 'Sedang Dikerjakan', value: 'IN_PROGRESS' },
  { label: 'Selesai', value: 'COMPLETED' },
  { label: 'Dibatalkan', value: 'CANCELLED' },
]

export const PAYMENT_METHODS = [
  { label: 'COD (Bayar di Tempat)', value: 'COD' },
  { label: 'Transfer Bank', value: 'TRANSFER' },
]

export const APP_NAME = 'SABUConnect'
export const APP_TAGLINE = 'Platform Layanan Terhubung Sabu Raijua'

export const DEFAULT_LISTING_IMAGE = '/images/placeholder.jpg'
