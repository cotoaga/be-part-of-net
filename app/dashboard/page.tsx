import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function Dashboard() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/root')
  }

  const handleSignOut = async () => {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/root')
  }

  return (
    <div className="min-h-screen bg-terminal-bg text-terminal-green p-8">
      <div className="max-w-4xl mx-auto">
        <header className="border-b border-terminal-green pb-4 mb-8">
          <h1 className="text-3xl font-mono text-center">
            NODE ZERO CONTROL CENTER
          </h1>
          <div className="text-center mt-2 text-sm">
            ACCESS GRANTED: {user.email}
          </div>
        </header>

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

        <div className="mt-8 text-center">
          <form action={handleSignOut}>
            <button
              type="submit"
              className="terminal-button"
            >
              DISCONNECT FROM NODE ZERO
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}