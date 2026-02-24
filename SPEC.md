# SABUConnect - Platform Layanan Terhubung Sabu Raijua

## 1. Project Overview

**Project Name:** SABUConnect  
**Type:** Full-stack Web Application (Next.js + PostgreSQL)  
**Core Functionality:** A digital platform connecting the Sabu Raijua community with local services, products, and businesses through WhatsApp-integrated listings  
**Target Users:** General public seeking local services, Service providers/UMKM, System administrators

---

## 2. UI/UX Specification

### 2.1 Layout Structure

#### Page Sections
- **Header:** Fixed navigation with logo, search bar, navigation links, and user menu
- **Hero Section:** Banner with tagline and CTA buttons (homepage only)
- **Content Area:** Main content with sidebar for filters
- **Footer:** Links, contact info, social media, copyright

#### Grid/Flex Layout
- Container max-width: 1280px, centered
- 12-column grid system
- Card-based layouts with CSS Grid
- Flexbox for component alignment

#### Responsive Breakpoints
- Mobile: < 640px (single column)
- Tablet: 640px - 1024px (2 columns)
- Desktop: > 1024px (3-4 columns)

### 2.2 Visual Design

#### Color Palette
```css
--color-primary: #1E3A5F;        /* Deep Navy - Trust & Professional */
--color-primary-light: #2E5A8F; /* Lighter navy */
--color-primary-dark: #0F1F33;  /* Darker navy */
--color-secondary: #F59E0B;      /* Amber - Energy & Local */
--color-secondary-light: #FCD34D;
--color-secondary-dark: #D97706;
--color-accent: #10B981;         /* Emerald - Success & Growth */
--color-accent-light: #34D399;
--color-background: #F8FAFC;    /* Light gray background */
--color-surface: #FFFFFF;        /* White cards */
--color-text-primary: #1E293B;  /* Dark slate */
--color-text-secondary: #64748B;/* Muted text */
--color-border: #E2E8F0;        /* Light border */
--color-error: #EF4444;         /* Red for errors */
--color-warning: #F59E0B;       /* Warning */
```

#### Typography
- **Headings:** "Plus Jakarta Sans", sans-serif (700 weight)
  - H1: 48px / 56px line-height
  - H2: 36px / 44px line-height
  - H3: 24px / 32px line-height
  - H4: 20px / 28px line-height
- **Body:** "Plus Jakarta Sans", sans-serif (400/500 weight)
  - Large: 18px / 28px
  - Base: 16px / 24px
  - Small: 14px / 20px
  - XSmall: 12px / 16px
- **Monospace:** "JetBrains Mono" (for codes/prices)

#### Spacing System
- Base unit: 4px
- Scale: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96px

#### Visual Effects
- Border radius: 8px (cards), 6px (buttons), 4px (inputs), 12px (modals)
- Shadows:
  - Small: 0 1px 2px rgba(0,0,0,0.05)
  - Medium: 0 4px 6px -1px rgba(0,0,0,0.1)
  - Large: 0 10px 15px -3px rgba(0,0,0,0.1)
- Transitions: 150ms ease-in-out (default)
- Hover effects: Scale 1.02, shadow elevation

### 2.3 Components

#### Navigation Bar
- Logo (left), Search input (center), Nav links + User menu (right)
- Mobile: Hamburger menu with slide-out drawer
- States: Default, scrolled (add shadow), mobile menu open

#### Buttons
- Primary: Navy background, white text
- Secondary: Amber background, dark text
- Outline: Transparent with border
- Ghost: No background, text only
- States: Default, hover (lighten), active (darken), disabled (50% opacity)
- Sizes: Small (32px), Medium (40px), Large (48px)

#### Cards (Listing)
- Image (aspect 4:3), Category badge, Title, Location, Price, WhatsApp button
- Hover: Elevate shadow, scale 1.02
- States: Default, loading (skeleton), error

#### Form Inputs
- Text, Textarea, Select, File Upload, Checkbox, Radio
- States: Default, focus (primary border), error (red border + message), disabled
- Sizes: Small, Medium, Large

#### Modals
- Overlay with backdrop blur
- Centered, max-width 500px
- Close button top-right
- Actions at bottom

#### Toast Notifications
- Position: Top-right
- Types: Success (green), Error (red), Warning (amber), Info (blue)
- Auto-dismiss after 5 seconds

---

## 3. Functionality Specification

### 3.1 Authentication System

#### Features
- User registration (email, password, name, phone, role)
- Login with email/password
- JWT-based authentication
- Password reset via email
- Role-based access control (User, Provider, Admin)

#### User Roles & Permissions
| Feature | User | Provider | Admin |
|---------|------|----------|-------|
| Browse listings | ✓ | ✓ | ✓ |
| Create listing | - | ✓ | ✓ |
| Edit own listing | - | ✓ | ✓ |
| Delete own listing | - | ✓ | ✓ |
| Contact via WhatsApp | ✓ | ✓ | ✓ |
| Create transactions | ✓ | - | - |
| Manage transactions | - | ✓ | ✓ |
| View all listings | - | - | ✓ |
| Verify users | - | - | ✓ |
| Manage categories | - | - | ✓ |
| View analytics | - | - | ✓ |

### 3.2 Listing Management

#### Listing Types
1. **Jasa (Services):** Tukang, Montir, Servis elektronik, dll
2. **Produk (Products):** Hasil pertanian, Seafood, Kerajinan, dll

#### Listing Fields
- Title (required, max 100 chars)
- Description (required, max 2000 chars)
- Category (required, from predefined list)
- Subcategory (optional)
- Price (required, number)
- Price type: Fixed / Negotiable / Starting from
- Images (1-5, max 5MB each)
- Location (Desa/Kelurahan)
- Contact phone (WhatsApp number)
- Status: Active / Inactive

#### Categories (Predefined)
**Jasa:**
- Konstruksi & Bangunan
- Reparasi & Montir
- Servis Elektronik
- Salon & Kecantikan
- Pendidikan & Les Privat
- Kesehatan & Fitness
- Transportasi
- Layanan Rumah Tangga
- Fotografi & Videografi
- Lainnya

**Produk:**
- Hasil Pertanian
- Hasil Laut & Perikan
- Kerajinan Tangan
- Makanan & Minuman
- Pakaian & Tekstil
- Tanaman & Bibit
- Ternak & Peternakan
- Lainnya

### 3.3 Search & Filter

#### Search
- Full-text search on title and description
- Debounced input (300ms)
- Search suggestions dropdown
- Recent searches (localStorage)

#### Filters
- Category (multi-select)
- Subcategory
- Price range (min-max slider)
- Location (Desa/Kelurahan dropdown)
- Listing type (Jasa/Produk)
- Sort by: Newest, Price Low-High, Price High-Low, Popular

#### Pagination
- 12 items per page
- Page numbers with prev/next
- "Load more" button option

### 3.4 WhatsApp Integration

#### Features
- Direct WhatsApp link with pre-filled message
- Message template: "Halo, saya tertarik dengan {listing title} dari SABUConnect"
- Click-to-chat without saving number
- Click tracking for analytics

### 3.5 Transaction System

#### Flow
1. User selects product/service
2. User initiates transaction request
3. Provider receives notification
4. Negotiation via WhatsApp
5. Choose payment method: COD / Transfer
6. Update transaction status
7. Complete transaction

#### Transaction Status
- Pending (user submitted)
- Accepted (provider confirmed)
- In Progress (being worked on)
- Completed (finished)
- Cancelled (by either party)

#### Payment Methods
- COD (Cash on Delivery)
- Transfer Bank (manual confirmation)

### 3.6 Admin Dashboard

#### Features
- Overview statistics (total users, listings, transactions)
- User management (verify, suspend, delete)
- Listing management (approve, reject, feature)
- Category management (CRUD)
- Transaction monitoring
- Report generation

---

## 4. Technical Architecture

### 4.1 Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** NextAuth.js + JWT
- **Styling:** Tailwind CSS
- **State Management:** React Context + SWR
- **Forms:** React Hook Form + Zod
- **Images:** Next.js Image + local upload

### 4.2 Project Structure
```
/app
  /api              # API routes
    /auth           # Auth endpoints
    /listings       # Listings CRUD
    /transactions   # Transactions
    /users          # User management
    /categories     # Categories
    /analytics      # Stats
  /(auth)
    /login          # Login page
    /register       # Register page
    /forgot-password
  /(dashboard)
    /dashboard      # User/Provider dashboard
    /admin          # Admin panel
    /listings       # Manage listings
    /transactions   # Manage transactions
    /profile        # User profile
  /(public)
    /               # Homepage
    /search         # Search results
    /listing/[id]   # Listing detail
    /category/[slug]# Category page
/components
  /ui               # Base UI components
  /forms            # Form components
  /layout           # Layout components
  /listings         # Listing-specific components
/lib
  /prisma           # Prisma client
  /auth             # Auth utilities
  /utils            # Helper functions
  /constants        # App constants
/types              # TypeScript types
```

### 4.3 Database Schema (Prisma)

```prisma
// User model
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  password      String
  name          String
  phone         String
  role          Role      @default(USER)
  isVerified    Boolean   @default(false)
  avatar        String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  listings      Listing[]
  transactions  Transaction[] @relation("CustomerTransactions")
  providerTransactions Transaction[] @relation("ProviderTransactions")
}

enum Role {
  USER
  PROVIDER
  ADMIN
}

// Category model
model Category {
  id          String    @id @default(cuid())
  name        String
  slug        String    @unique
  type        CategoryType
  image       String?
  parentId    String?
  parent      Category? @relation("CategoryHierarchy", fields: [parentId], references: [id])
  children    Category[] @relation("CategoryHierarchy")
  listings    Listing[]
  createdAt   DateTime  @default(now())
}

enum CategoryType {
  JASA
  PRODUK
}

// Listing model
model Listing {
  id          String    @id @default(cuid())
  title       String
  slug        String    @unique
  description String
  price       Decimal
  priceType   PriceType @default(FIXED)
  images      String[]  // JSON array of URLs
  location    String
  phone       String
  status      ListingStatus @default(ACTIVE)
  isFeatured  Boolean   @default(false)
  views       Int       @default(0)
  userId      String
  user        User      @relation(fields: [userId], references: [id])
  categoryId  String
  category    Category  @relation(fields: [categoryId], references: [id])
  transactions Transaction[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

enum PriceType {
  FIXED
  NEGOTIABLE
  STARTING_FROM
}

enum ListingStatus {
  ACTIVE
  INACTIVE
  PENDING
  REJECTED
}

// Transaction model
model Transaction {
  id            String            @id @default(cuid())
  listingId     String
  listing       Listing           @relation(fields: [listingId], references: [id])
  customerId    String
  customer      User              @relation("CustomerTransactions", fields: [customerId], references: [id])
  providerId    String
  provider      User              @relation("ProviderTransactions", fields: [providerId], references: [id])
  status        TransactionStatus @default(PENDING)
  paymentMethod PaymentMethod?
  notes         String?
  amount        Decimal
  createdAt     DateTime          @default(now())
  updatedAt     DateTime          @updatedAt
}

enum TransactionStatus {
  PENDING
  ACCEPTED
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

enum PaymentMethod {
  COD
  TRANSFER
}

// WhatsApp Click Tracking
model WhatsAppClick {
  id        String   @id @default(cuid())
  listingId String
  phone     String
  createdAt DateTime @default(now())
}
```

---

## 5. API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `GET /api/auth/session` - Get current session

### Listings
- `GET /api/listings` - List all listings (with filters)
- `GET /api/listings/[id]` - Get single listing
- `POST /api/listings` - Create listing (Provider/Admin)
- `PUT /api/listings/[id]` - Update listing
- `DELETE /api/listings/[id]` - Delete listing
- `POST /api/listings/[id]/whatsapp` - Track WhatsApp click

### Categories
- `GET /api/categories` - List all categories
- `GET /api/categories/[slug]` - Get category with listings
- `POST /api/categories` - Create category (Admin)
- `PUT /api/categories/[id]` - Update category (Admin)
- `DELETE /api/categories/[id]` - Delete category (Admin)

### Transactions
- `GET /api/transactions` - List user transactions
- `POST /api/transactions` - Create transaction
- `PUT /api/transactions/[id]` - Update transaction status

### Users
- `GET /api/users` - List users (Admin)
- `GET /api/users/[id]` - Get user profile
- `PUT /api/users/[id]` - Update user
- `DELETE /api/users/[id]` - Delete user (Admin)

### Analytics
- `GET /api/analytics/overview` - Dashboard stats

---

## 6. Pages

### Public Pages
1. **Homepage (`/`)** - Hero, featured listings, categories, CTA
2. **Search (`/search`)** - Search results with filters
3. **Listing Detail (`/listing/[slug]`)** - Full listing info + WhatsApp
4. **Category (`/category/[slug]`)** - Category listings

### Auth Pages
5. **Login (`/login`)** - Email/password login
6. **Register (`/register`)** - New user registration
7. **Forgot Password (`/forgot-password`)** - Reset request

### Dashboard Pages
8. **User Dashboard (`/dashboard`)** - My activity, saved listings
9. **Provider Dashboard (`/provider`)** - My listings, transactions
10. **My Listings (`/provider/listings`)** - Manage listings
11. **Create Listing (`/provider/listings/new`)** - Add new
12. **Edit Listing (`/provider/listings/[id]/edit`)** - Update
13. **Transactions (`/dashboard/transactions`)** - Transaction list
14. **Profile (`/profile`)** - Edit profile

### Admin Pages
15. **Admin Dashboard (`/admin`)** - Overview & stats
16. **User Management (`/admin/users`)** - Manage users
17. **All Listings (`/admin/listings`)** - All listings
18. **Categories (`/admin/categories`)** - Manage categories

---

## 7. Acceptance Criteria

### Authentication
- [ ] User can register with email, password, name, phone
- [ ] User can login with email/password
- [ ] JWT tokens are properly managed
- [ ] Role-based access works correctly
- [ ] Password reset flow functions

### Listings
- [ ] Provider can create listing with all fields
- [ ] Images upload and display correctly
- [ ] Listings appear in search results
- [ ] Category filtering works
- [ ] Location filter works
- [ ] Price sorting works
- [ ] Listing detail page shows all info

### WhatsApp Integration
- [ ] WhatsApp button opens with pre-filled message
- [ ] Click is tracked in database

### Transactions
- [ ] User can create transaction request
- [ ] Provider can accept/update status
- [ ] Status changes reflect correctly

### Admin
- [ ] Admin can view all users
- [ ] Admin can verify/suspend users
- [ ] Admin can manage categories
- [ ] Admin dashboard shows correct stats

### UI/UX
- [ ] Responsive on mobile, tablet, desktop
- [ ] All colors match specification
- [ ] Typography matches specification
- [ ] Loading states display correctly
- [ ] Error messages are user-friendly

---

## 8. Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/sabuconnect"

# Auth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_WHATSAPP_PREFIX="628"
```

---

*Document Version: 1.0*
*Created: 2026-02-22*
