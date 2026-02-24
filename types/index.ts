export type Role = 'USER' | 'PROVIDER' | 'ADMIN'
export type CategoryType = 'JASA' | 'PRODUK'
export type PriceType = 'FIXED' | 'NEGOTIABLE' | 'STARTING_FROM'
export type ListingStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'REJECTED'
export type TransactionStatus = 'PENDING' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
export type PaymentMethod = 'COD' | 'TRANSFER'

export type PromotionStatus = 'NONE' | 'PENDING_APPROVAL' | 'WAITING_PAYMENT' | 'PAYMENT_UPLOADED' | 'ACTIVE' | 'REJECTED' | 'EXPIRED' | 'STOPPED'
export type PromotionPaymentStatus = 'PENDING' | 'VERIFIED' | 'REJECTED'

export interface User {
  id: string
  email: string
  name: string
  phone: string
  role: Role
  isVerified: boolean
  avatar?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Category {
  id: string
  name: string
  slug: string
  type: CategoryType
  image?: string | null
  parentId?: string | null
  createdAt: Date
  updatedAt: Date
}

// Prisma Decimal type
type Decimal = {
  toNumber(): number
  toString(): string
}

export interface Listing {
  id: string
  title: string
  slug: string
  description: string
  price: number | string | Decimal
  priceType: PriceType
  images: string[]
  location: string
  phone: string
  status: ListingStatus
  isFeatured: boolean
  views: number
  userId: string
  user?: Partial<User>
  categoryId: string
  category?: Partial<Category>
  // Promotion fields
  promotionStatus?: PromotionStatus
  promotionStart?: Date | string | null
  promotionEnd?: Date | string | null
  promotionDays?: number | null
  promotionPrice?: number | string | Decimal | null
  promotionPriority?: number
  promotion?: PromotionPayment | null
  createdAt: Date
  updatedAt: Date
}

export interface Transaction {
  id: string
  listingId: string
  listing?: Listing
  customerId: string
  customer?: User
  providerId: string
  provider?: User
  status: TransactionStatus
  paymentMethod?: PaymentMethod | null
  notes?: string | null
  amount: number | string | Decimal
  createdAt: Date
  updatedAt: Date
}

export interface ListingInput {
  title: string
  description: string
  price: number
  priceType: PriceType
  images: string[]
  location: string
  phone: string
  categoryId: string
}

export interface TransactionInput {
  listingId: string
  paymentMethod?: PaymentMethod
  notes?: string
  amount: number
}

export interface SearchFilters {
  query?: string
  categoryId?: string
  type?: CategoryType
  minPrice?: number
  maxPrice?: number
  location?: string
  sortBy?: 'newest' | 'price_asc' | 'price_desc' | 'popular'
  page?: number
  limit?: number
}

export interface PromotionPayment {
  id: string
  listingId: string
  listing?: Partial<Listing>
  providerId: string
  amount: number | string | Decimal
  method: PaymentMethod
  proofImage?: string | null
  status: PromotionPaymentStatus
  verifiedBy?: string | null
  verifiedAt?: Date | string | null
  rejectionReason?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface PromoteListingInput {
  days: number
  method: PaymentMethod
}
