'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import CivilizedLayout from '@/components/CivilizedLayout'
import ThemeToggle from '@/components/ThemeToggle'

// Import GraphVisualization dynamically with SSR disabled (Three.js requires browser)
const GraphVisualization = dynamic(() => import('@/components/GraphVisualization'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] flex items-center justify-center border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900">
      <div className="font-sans text-soft-gray dark:text-gray-400">
        Loading visualization...
      </div>
    </div>
  ),
})

export default function NetworkPage() {
  const router = useRouter()
  const supabase = createClient()
  const [userName, setUserName] = useState<string>('')
  const [userEmail, setUserEmail] = useState<string>('')

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
      } else {
        setUserEmail(user.email || '')

        // Try to get node name from database (NEW schema)
        const { data: node } = await supabase
          .from('nodes')
          .select('name')
          .contains('controlled_by', [user.id])
          .eq('type', 'person')
          .eq('is_demo', false)
          .maybeSingle()

        setUserName(node?.name || user.email?.split('@')[0] || 'User')
      }
    }
    getUser()
  }, [router, supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <CivilizedLayout>
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">
                Your Network
              </h1>
              <p className="text-sm font-sans text-soft-gray dark:text-gray-400 mt-1">
                Welcome back, {userName}
              </p>
            </div>
            <div className="flex gap-4 items-center">
              <ThemeToggle />
              <button
                onClick={handleSignOut}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-klein-bottle-green dark:hover:border-deep-space-blue text-gray-700 dark:text-gray-300 font-sans transition"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Graph Visualization */}
        <div className="mb-8">
          <h2 className="text-xl font-display font-semibold text-gray-900 dark:text-white mb-4">
            Network Visualization
          </h2>
          <GraphVisualization />
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm">
            <div className="text-sm font-sans font-medium text-soft-gray dark:text-gray-400 mb-1">
              Total Connections
            </div>
            <div className="text-3xl font-display font-bold text-gray-900 dark:text-white">
              --
            </div>
            <p className="text-xs font-sans text-soft-gray dark:text-gray-500 mt-2">
              Coming soon
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm">
            <div className="text-sm font-sans font-medium text-soft-gray dark:text-gray-400 mb-1">
              Network Depth
            </div>
            <div className="text-3xl font-display font-bold text-gray-900 dark:text-white">
              --
            </div>
            <p className="text-xs font-sans text-soft-gray dark:text-gray-500 mt-2">
              Hops from center
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm">
            <div className="text-sm font-sans font-medium text-soft-gray dark:text-gray-400 mb-1">
              Your Temperature
            </div>
            <div className="text-3xl font-display font-bold text-gray-900 dark:text-white">
              --
            </div>
            <p className="text-xs font-sans text-soft-gray dark:text-gray-500 mt-2">
              Activity level
            </p>
          </div>
        </div>

        {/* Philosophy Section */}
        <div className="mt-8 bg-green-50 dark:bg-green-900/20 border border-klein-bottle-green/30 dark:border-deep-space-blue/30 rounded-lg p-6">
          <h3 className="text-lg font-display font-semibold text-klein-bottle-green dark:text-deep-space-blue mb-2">
            The Anti-Social Social Network
          </h3>
          <p className="text-sm font-sans text-gray-700 dark:text-gray-300">
            No posts. No likes. No endless scroll. Just the network of connections that matter to you.
          </p>
        </div>
      </main>
    </CivilizedLayout>
  )
}
