import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Node Zero Control Center',
  description: 'Administrative interface for the consciousness network',
  icons: {
    icon: '/icon.svg',
    shortcut: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-mono">{children}</body>
    </html>
  )
}