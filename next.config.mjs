/** @type {import('next').NextConfig} */
const config = {
  transpilePackages: ['next-sanity', 'sanity', '@sanity/client'],
  images: {
    dangerouslyAllowSVG: true,
    unoptimized: false,
    remotePatterns: [{ hostname: 'cdn.sanity.io' }],
    // @TODO: reduce amount of device sizes to lower srcset (would this create less requets to the sanity cdn?)
    deviceSizes: [480, 768, 1024, 1240, 1600, 1920],
  },
  typescript: {
    // Set this to false if you want production builds to abort if there's type errors
    // ignoreBuildErrors: process.env.VERCEL_ENV === 'production',
    ignoreBuildErrors: true,
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  experimental: {
    taint: true,
    optimizePackageImports: ['@chakra-ui/react'],
  },
  // Turbopack replacement for the webpack SVG rule
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
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
