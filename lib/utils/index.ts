import { type ClassValue, clsx } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function formatPrice(price: number | string | { toNumber(): number; toString(): string }): string {
  let numPrice: number
  if (typeof price === 'object' && price !== null && 'toNumber' in price) {
    numPrice = price.toNumber()
  } else if (typeof price === 'string') {
    numPrice = parseFloat(price)
  } else {
    numPrice = price
  }
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numPrice)
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function generateWhatsAppLink(phone: string, message: string): string {
  const normalizedPhone = normalizePhoneNumber(phone)
  
  // If phone cannot be normalized, return empty string
  if (!normalizedPhone) {
    return ''
  }
  
  const encodedMessage = encodeURIComponent(message)
  return `https://wa.me/${normalizedPhone}?text=${encodedMessage}`
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/**
 * Normalizes Indonesian phone numbers to standard format (62xxxxxxxxxx)
 * Handles various formats: +62, 62, 0, or 8 at the start
 * @param phone - The phone number string to normalize
 * @returns Normalized phone number in 62xxxxxxxxxx format or null if invalid
 */
export function normalizePhoneNumber(phone: string): string | null {
  // Check if input is valid
  if (!phone || typeof phone !== 'string') {
    return null
  }

  // Remove all non-digit characters except +
  let cleaned = phone.replace(/[^0-9+]/g, '')

  // Handle empty result after cleaning
  if (!cleaned) {
    return null
  }

  // Handle various formats
  // +62xxxxxxxxxx -> 62xxxxxxxxxx
  if (cleaned.startsWith('+62')) {
    cleaned = cleaned.replace(/^\+62/, '62')
  }
  // 62xxxxxxxxxx -> 62xxxxxxxxxx (already correct)
  else if (cleaned.startsWith('62')) {
    // Already starts with 62, keep as is
  }
  // 0xxxxxxxxxx -> 62xxxxxxxxxx (remove leading 0)
  else if (cleaned.startsWith('0')) {
    cleaned = cleaned.replace(/^0/, '62')
  }
  // 8xxxxxxxxxx (local number without leading 0) -> 62xxxxxxxxxx
  else if (/^8\d{8,11}$/.test(cleaned)) {
    cleaned = '62' + cleaned
  }
  // If starts with other digits, try to extract the phone number
  else {
    // Find any sequence of digits starting with 8
    const match = cleaned.match(/8\d{8,11}/)
    if (match) {
      cleaned = '62' + match[0]
    } else {
      return null
    }
  }

  // Validate the final format (62 followed by 9-12 digits)
  const finalPattern = /^62\d{9,12}$/
  if (!finalPattern.test(cleaned)) {
    return null
  }

  return cleaned
}
