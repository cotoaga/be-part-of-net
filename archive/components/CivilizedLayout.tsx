'use client'

import { ThemeProvider } from '@/lib/contexts/ThemeContext'
import { ReactNode } from 'react'

/**
 * Layout wrapper for civilized routes (/, /login, /network)
 * Provides theme context and applies COTOAGA.AI design system
 * Terminal routes (/root, /node-zero) bypass this wrapper
 */
export default function CivilizedLayout({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-warm-canvas dark:bg-midnight-void text-gray-900 dark:text-gray-100 font-sans transition-colors duration-200">
        {children}
      </div>
    </ThemeProvider>
  )
}
