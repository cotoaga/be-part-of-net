'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) throw error
      }
      router.push('/dashboard')
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-terminal-bg text-terminal-green flex items-center justify-center p-4">
      <div className="border border-terminal-green p-8 max-w-md w-full">
        <h1 className="text-2xl mb-6 text-center font-mono">
          NODE ZERO ACCESS
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm mb-2 font-mono">
              EMAIL_ADDRESS
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="terminal-input w-full"
              placeholder="your@email.com"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm mb-2 font-mono">
              PASSWORD
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="terminal-input w-full"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm font-mono border border-red-500 p-2">
              ERROR: {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="terminal-button w-full"
          >
            {loading ? 'ACCESSING...' : isLogin ? 'ENTER THE GARDEN' : 'CREATE GOD ACCOUNT'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="terminal-link text-sm"
          >
            {isLogin ? 'Need to create an account?' : 'Already have access?'}
          </button>
        </div>
      </div>
    </div>
  )
}