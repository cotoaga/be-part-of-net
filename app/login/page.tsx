'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import CivilizedLayout from '@/components/CivilizedLayout'
import ThemeToggle from '@/components/ThemeToggle'

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/api/auth/callback`,
          },
        })
        if (error) throw error
        setMessage({ type: 'success', text: 'Check your email to confirm your account!' })
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        router.push('/network')
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <CivilizedLayout>
      {/* Theme Toggle - Fixed Position */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          {/* Friendly Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-display font-bold text-gray-900 dark:text-white mb-2">
              Welcome
            </h1>
            <p className="font-sans text-soft-gray dark:text-gray-400">
              {isSignUp ? 'Join the network' : 'Sign in to explore your network'}
            </p>
          </div>

          {/* Clean Auth Form */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 border border-gray-200 dark:border-gray-700">
            <form onSubmit={handleAuth} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-sans font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-sans focus:ring-2 focus:ring-klein-bottle-green dark:focus:ring-deep-space-blue focus:border-transparent transition"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-sans font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-sans focus:ring-2 focus:ring-klein-bottle-green dark:focus:ring-deep-space-blue focus:border-transparent transition"
                  placeholder="••••••••"
                />
              </div>

              {message && (
                <div className={`p-4 rounded-lg font-sans ${
                  message.type === 'error'
                    ? 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
                    : 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                }`}>
                  {message.text}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-klein-bottle-green dark:bg-deep-space-blue hover:opacity-90 text-white py-3 rounded-lg transition font-sans font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In')}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp)
                  setMessage(null)
                }}
                className="text-sm font-sans text-soft-gray dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
              >
                {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
              </button>
            </div>
          </div>

          {/* Easter egg hint for nerds */}
          <p className="text-center text-sm font-sans text-soft-gray dark:text-gray-400 mt-4">
            Looking for the{' '}
            <a href="/root" className="text-klein-bottle-green dark:text-deep-space-blue hover:underline">
              other entrance
            </a>
            ?
          </p>
        </div>
      </div>
    </CivilizedLayout>
  )
}
