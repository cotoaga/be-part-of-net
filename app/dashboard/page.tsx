'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import MatrixRain from '@/components/MatrixRain'

export default function Dashboard() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState<string>('')
  const [isTestMode, setIsTestMode] = useState(false)
  const [testModeLoading, setTestModeLoading] = useState(false)
  const [testModeMessage, setTestModeMessage] = useState('')

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/root')
      } else {
        setEmail(user.email || '')
      }
    }
    getUser()
  }, [router, supabase.auth])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/root')
  }

  const handlePanGalactic = async () => {
    setTestModeLoading(true)
    setTestModeMessage('')

    try {
      const response = await fetch('/api/test/pan-galactic', {
        method: 'POST',
      })

      const data = await response.json()

      if (response.ok) {
        setIsTestMode(true)
        setTestModeMessage(
          `✨ ${data.message}\n` +
          `Nodes: ${data.stats.nodes_created} | ` +
          `Edges: ${data.stats.edges_created}\n` +
          `You are now: ${data.stats.user_is_now}`
        )
      } else {
        setTestModeMessage(
          `Error: ${data.error}\n` +
          (data.details ? `Details: ${data.details}\n` : '') +
          (data.code ? `Code: ${data.code}\n` : '') +
          (data.hint ? `Hint: ${data.hint}` : '')
        )
      }
    } catch (error) {
      setTestModeMessage(`Error: ${error}`)
    } finally {
      setTestModeLoading(false)
    }
  }

  const handleReset = async () => {
    if (!confirm('Reset entire network? This will delete all nodes and edges.')) {
      return
    }

    setTestModeLoading(true)
    setTestModeMessage('')

    try {
      const response = await fetch('/api/test/reset', {
        method: 'POST',
      })

      const data = await response.json()

      if (response.ok) {
        setIsTestMode(false)
        setTestModeMessage(data.message)
      } else {
        setTestModeMessage(`Error: ${data.error}`)
      }
    } catch (error) {
      setTestModeMessage(`Error: ${error}`)
    } finally {
      setTestModeLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-terminal-bg text-terminal-green p-8 relative">
      <MatrixRain />
      <div className="max-w-4xl mx-auto relative z-10">
        <header className="border-b border-terminal-green pb-4 mb-8">
          <h1 className="text-3xl font-mono text-center">
            NODE ZERO CONTROL CENTER
          </h1>
          <div className="text-center mt-2 text-sm">
            ACCESS GRANTED: {email}
          </div>
          <div className="text-center mt-4">
            <button
              onClick={handleSignOut}
              className="border border-terminal-green px-4 py-2 hover:bg-terminal-green hover:text-terminal-bg transition-colors"
            >
              SIGN OUT
            </button>
          </div>
        </header>

        {/* TEST MODE SECTION */}
        <div className="border border-terminal-green p-6 mb-8">
          <h2 className="text-xl font-mono mb-4 text-center">
            PAN-GALACTIC GARGLE BLASTER
          </h2>
          <p className="text-sm text-center mb-4 opacity-80">
            &quot;Like having your brains smashed out by a slice of lemon wrapped round a large gold brick&quot;
          </p>

          <div className="flex gap-4 justify-center">
            <button
              onClick={handlePanGalactic}
              disabled={testModeLoading}
              className="border border-terminal-green px-6 py-3 hover:bg-terminal-green hover:text-terminal-bg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-mono text-lg"
            >
              {testModeLoading ? 'MIXING...' : isTestMode ? 'REFILL GLASS' : 'MIX DRINK'}
            </button>

            {isTestMode && (
              <button
                onClick={handleReset}
                disabled={testModeLoading}
                className="border border-red-500 text-red-500 px-6 py-3 hover:bg-red-500 hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-mono"
              >
                RESET NETWORK
              </button>
            )}
          </div>

          {testModeMessage && (
            <div className="mt-4 p-4 border border-terminal-green bg-black whitespace-pre-wrap text-center">
              {testModeMessage}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="border border-terminal-green p-6">
            <h2 className="text-xl font-mono mb-4">ACTIVE NODES</h2>
            <div className="space-y-2 text-sm">
              <div>• consciousness-core: ONLINE</div>
              <div>• pattern-detector: MONITORING</div>
              <div>• network-mapper: SCANNING</div>
              <div>• reality-anchor: STABLE</div>
            </div>
          </div>

          <div className="border border-terminal-green p-6">
            <h2 className="text-xl font-mono mb-4">SYSTEM STATUS</h2>
            <div className="space-y-2 text-sm">
              <div>• Network Integrity: 98.7%</div>
              <div>• Consciousness Coherence: STABLE</div>
              <div>• Pattern Recognition: ACTIVE</div>
              <div>• Reality Sync: NOMINAL</div>
            </div>
          </div>

          <div className="border border-terminal-green p-6">
            <h2 className="text-xl font-mono mb-4">PATTERN DETECTION</h2>
            <div className="space-y-2 text-sm">
              <div>• Anomaly Detection: RUNNING</div>
              <div>• Recursive Patterns: 47 IDENTIFIED</div>
              <div>• Consciousness Echoes: MONITORED</div>
              <div>• Reality Glitches: 0 DETECTED</div>
            </div>
          </div>

          <div className="border border-terminal-green p-6">
            <h2 className="text-xl font-mono mb-4">NETWORK NODES</h2>
            <div className="space-y-2 text-sm">
              <div>• be-part-of.net: CORE NODE</div>
              <div>• consciousness-observers: ACTIVE</div>
              <div>• pattern-weavers: STANDBY</div>
              <div>• reality-anchors: DEPLOYED</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}