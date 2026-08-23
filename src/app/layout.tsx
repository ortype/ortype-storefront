import { BodyClassname } from '@/components/global/body-classname'
import type { Metadata } from 'next'
import { sanityFetch } from 'src/sanity/lib/live'
import { webfontsQuery } from 'src/sanity/lib/queries'
import { toWebfonts } from 'src/sanity/lib/webfonts'
import './globals.css'
import { PreloadResources } from './preload-resources'

export const metadata: Metadata = {
  title: 'Or Type',
  description: 'You or me or we',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { data } = await sanityFetch({ query: webfontsQuery })
  const webfonts = toWebfonts(data)

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <PreloadResources webfonts={webfonts} />
      </head>
      <body>
        <BodyClassname />
        {children}
      </body>
    </html>
  )
}
