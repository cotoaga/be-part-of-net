'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import CivilizedLayout from '@/components/CivilizedLayout'

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
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Graph Visualization */}
        <GraphVisualization onSignOut={handleSignOut} userName={userName} />
      </main>
    </CivilizedLayout>
  )
}
