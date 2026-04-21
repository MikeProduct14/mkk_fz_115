import type { NextConfig } from 'next'

// Validate required environment variables at startup
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
] as const

for (const key of requiredEnvVars) {
  if (!process.env[key]) {
    throw new Error(
      `Missing required environment variable: ${key}\n` +
      `Add it to .env.local before starting the server.`
    )
  }
}

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: '/clients', destination: '/dashboard/clients', permanent: true },
      { source: '/clients/:path*', destination: '/dashboard/clients/:path*', permanent: true },
    ]
  },
}

export default nextConfig
