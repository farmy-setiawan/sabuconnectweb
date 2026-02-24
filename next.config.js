/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'res.cloudinary.com', 'images.unsplash.com'],
    formats: ['image/avif', 'image/webp'],
  },
  // Enable experimental features for better performance
  experimental: {
    optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react'],
  },
  // Compression
  compress: true,
  // Reduce bundle size by not generating etags
  generateEtags: false,
  // Powerpuff optimizations
  poweredByHeader: false,
}

module.exports = nextConfig
