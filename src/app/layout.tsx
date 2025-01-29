import type { Metadata } from 'next'
import './globals.css'

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
      <body className="min-h-screen bg-white">{children}</body>
    </html>
  )
}
