'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import MatrixRain from '@/components/MatrixRain'

// Chaos Star SVG Component
const ChaosStar = () => (
  <svg width="80" height="80" viewBox="0 0 32 32" className="chaos-star-auth">
    <defs>
      <radialGradient id="hubGradientAuth" cx="50%" cy="30%" r="70%">
        <stop offset="0%" style={{stopColor:'#00ff00', stopOpacity:0.8}} />
        <stop offset="100%" style={{stopColor:'#10b981', stopOpacity:0.6}} />
      </radialGradient>
    </defs>
    
    {/* 8 perfectly aligned arrows - terminal green theme */}
    {/* Arrow 1: Up (0°) */}
    <g className="arrow-up">
      <line x1="16" y1="16" x2="16" y2="3" stroke="#00ff00" strokeWidth="2"/>
      <polygon points="16,1 13,6 19,6" fill="#00ff00"/>
      <polygon points="16,19 13,14 19,14" fill="#00ff00"/>
    </g>
    
    {/* Arrow 2: Up-Right (45°) */}
    <g className="arrow-up-right">
      <line x1="16" y1="16" x2="25.2" y2="6.8" stroke="#00ff00" strokeWidth="2"/>
      <polygon points="27.1,4.9 21.4,7.6 23.8,12.2" fill="#00ff00"/>
      <polygon points="17.8,17.8 12.2,15.4 14.9,20.1" fill="#00ff00"/>
    </g>
    
    {/* Arrow 3: Right (90°) */}
    <g className="arrow-right">
      <line x1="16" y1="16" x2="29" y2="16" stroke="#00ff00" strokeWidth="2"/>
      <polygon points="31,16 26,13 26,19" fill="#00ff00"/>
      <polygon points="13,16 18,13 18,19" fill="#00ff00"/>
    </g>
    
    {/* Arrow 4: Down-Right (135°) */}
    <g className="arrow-down-right">
      <line x1="16" y1="16" x2="25.2" y2="25.2" stroke="#00ff00" strokeWidth="2"/>
      <polygon points="27.1,27.1 23.8,19.8 21.4,24.4" fill="#00ff00"/>
      <polygon points="17.8,14.2 14.9,11.9 12.2,16.6" fill="#00ff00"/>
    </g>
    
    {/* Arrow 5: Down (180°) */}
    <g className="arrow-down">
      <line x1="16" y1="16" x2="16" y2="29" stroke="#00ff00" strokeWidth="2"/>
      <polygon points="16,31 19,26 13,26" fill="#00ff00"/>
      <polygon points="16,13 19,18 13,18" fill="#00ff00"/>
    </g>
    
    {/* Arrow 6: Down-Left (225°) */}
    <g className="arrow-down-left">
      <line x1="16" y1="16" x2="6.8" y2="25.2" stroke="#00ff00" strokeWidth="2"/>
      <polygon points="4.9,27.1 12.2,23.8 7.6,21.4" fill="#00ff00"/>
      <polygon points="14.2,17.8 20.1,14.9 16.6,12.2" fill="#00ff00"/>
    </g>
    
    {/* Arrow 7: Left (270°) */}
    <g className="arrow-left">
      <line x1="16" y1="16" x2="3" y2="16" stroke="#00ff00" strokeWidth="2"/>
      <polygon points="1,16 6,19 6,13" fill="#00ff00"/>
      <polygon points="19,16 14,19 14,13" fill="#00ff00"/>
    </g>
    
    {/* Arrow 8: Up-Left (315°) */}
    <g className="arrow-up-left">
      <line x1="16" y1="16" x2="6.8" y2="6.8" stroke="#00ff00" strokeWidth="2"/>
      <polygon points="4.9,4.9 7.6,10.6 12.2,8.2" fill="#00ff00"/>
      <polygon points="14.2,14.2 11.9,17.1 16.6,19.8" fill="#00ff00"/>
    </g>
    
    {/* Central Hub - terminal themed */}
    <circle cx="16" cy="16" r="5.5" fill="url(#hubGradientAuth)" stroke="#00ff00" strokeWidth="1"/>
    <circle cx="16" cy="16" r="3.5" fill="#000000" opacity="0.8"/>
    <circle cx="16" cy="16" r="1.5" fill="#00ff00" opacity="0.9"/>
  </svg>
)

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
    <>
      {/* Matrix Rain Background */}
      <MatrixRain />
      
      <div className="min-h-screen bg-black/40 text-terminal-green flex items-center justify-center p-4 relative z-10">
        <div className="border border-terminal-green p-8 max-w-md w-full bg-black/90 backdrop-blur-sm">
          {/* Chaos Star Logo */}
          <div className="flex justify-center mb-4">
            <ChaosStar />
          </div>
          
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
          
          {/* Matrix-inspired footer text */}
          <div className="mt-8 text-center text-xs opacity-60">
            THE MATRIX HAS YOU...
          </div>
        </div>
      </div>
    </>
  )
}