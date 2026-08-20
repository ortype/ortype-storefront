import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  // While staging, disallow all crawling
  if (process.env.SITE_INDEXABLE !== 'true') {
    return {
      rules: {
        userAgent: '*',
        disallow: '/',
      },
      crawlDelay: 10,
    }
  }

  // At launch, allow normal crawling
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
  }
}
