import type { Metadata } from 'next'
import './globals.css'
import { BodyClassname } from '@/components/global/body-classname'

export const metadata: Metadata = {
  title: 'Or Type',
  description: 'You or me or we',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <BodyClassname />
        {children}
      </body>
    </html>
  )
}
