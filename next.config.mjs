/** @type {import('next').NextConfig} */

const config = {
  experimental: {
    // Used to guard against accidentally leaking SANITY_API_READ_TOKEN to the browser
    taint: true,
    optimizePackageImports: ['@chakra-ui/react'],
  },
  logging: {
    fetches: { fullUrl: false },
  },
  images: {
    remotePatterns: [{ hostname: 'cdn.sanity.io' }],
  },
  typescript: {
    // Set this to false if you want production builds to abort if there's type errors
    // ignoreBuildErrors: process.env.VERCEL_ENV === 'production',
    ignoreBuildErrors: true,
  },
  eslint: {
    // Set this to false if you want production builds to abort if there's lint errors
    // ignoreDuringBuilds: process.env.VERCEL_ENV === 'production',
    ignoreDuringBuilds: true,
  },
  webpack: (config, context) => {
    config.module.rules.push({
      test: /\.svg$/,
      use: '@svgr/webpack',
    })
    return config
  },
}
export default config
