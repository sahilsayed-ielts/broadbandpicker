import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Development only: lets a phone on the same Wi-Fi load the local dev server
  // (http://192.168.1.217:3000). Has no effect on production builds.
  allowedDevOrigins: ['192.168.1.217'],
  async redirects() {
    return [
      {
        source: '/updates',
        destination: '/',
        permanent: true,
      },
      {
        source: '/speed-test',
        destination: '/tools/speed-test',
        permanent: true,
      },
      {
        source: '/alerts',
        destination: '/',
        permanent: false,
      },
      {
        source: '/alerts/weekly',
        destination: '/',
        permanent: false,
      },
    ]
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Permissions-Policy', value: 'geolocation=(self)' },
        ],
      },
      {
        source: '/logos/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/illustrations/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/logo.png',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ]
  },
}

export default nextConfig
