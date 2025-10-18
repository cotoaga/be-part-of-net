import type { Metadata } from 'next'
import './globals.css'
import { inter, spaceGrotesk, jetbrainsMono } from '@/lib/fonts'

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
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
    >
      <body className="font-terminal-mono">{children}</body>
    </html>
  )
}