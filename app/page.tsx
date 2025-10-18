'use client'

import { useState } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'

// Import GraphVisualization dynamically
const GraphVisualization = dynamic(() => import('@/components/GraphVisualization'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full text-gray-400">
      <p className="text-lg">Loading visualization...</p>
    </div>
  ),
})

// Client-side test data (no database writes)
const generateTestNetwork = () => {
  return {
    nodes: [
      { id: '1', node_name: 'Zaphod Beeblebrox', node_type: 'human', temperature: 10.0, position: [0, 0, 0], velocity: [0, 0, 0], edges: ['2', '3', '4', '6'] },
      { id: '2', node_name: 'Ford Prefect', node_type: 'human', temperature: 8.5, position: [5, 0, 0], velocity: [0, 0, 0], edges: ['1', '3', '5'] },
      { id: '3', node_name: 'Marvin', node_type: 'ai', temperature: 1.0, position: [0, 5, 0], velocity: [0, 0, 0], edges: ['1', '2', '5'] },
      { id: '4', node_name: 'Eddie', node_type: 'ai', temperature: 9.5, position: [-5, 0, 0], velocity: [0, 0, 0], edges: ['1', '6'] },
      { id: '5', node_name: 'Deep Thought', node_type: 'ai', temperature: 0.5, position: [0, -5, 0], velocity: [0, 0, 0], edges: ['2', '3'] },
      { id: '6', node_name: 'Heart of Gold', node_type: 'ai', temperature: 7.5, position: [3, 3, 0], velocity: [0, 0, 0], edges: ['1', '4'] },
    ],
    edges: [
      { source: '1', target: '2' },
      { source: '1', target: '3' },
      { source: '1', target: '4' },
      { source: '1', target: '6' },
      { source: '2', target: '3' },
      { source: '2', target: '5' },
      { source: '3', target: '5' },
      { source: '4', target: '6' },
    ]
  }
}

export default function PublicLanding() {
  const [exploreMode, setExploreMode] = useState(false)
  const [testData, setTestData] = useState<any>(null)

  const toggleExplore = () => {
    if (!exploreMode) {
      setTestData(generateTestNetwork())
    } else {
      setTestData(null)
    }
    setExploreMode(!exploreMode)
  }

  return (
    <main className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <header className="p-8 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-2">
          be-part-of.net
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400">
          The anti-social social network
        </p>
      </header>

      {/* 3D Graph Visualization */}
      <div className="h-[500px] md:h-[600px] border border-gray-200 dark:border-gray-700 mx-4 md:mx-8 rounded-xl overflow-hidden shadow-lg bg-white dark:bg-gray-900">
        {exploreMode && testData ? (
          <GraphVisualization data={testData} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <p className="text-lg mb-2">The network awaits</p>
            <p className="text-sm">Click 🍸 below to explore</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center p-8">
        <button
          onClick={toggleExplore}
          className="px-6 py-3 text-2xl border-2 border-gray-300 dark:border-gray-600 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition shadow-sm"
        >
          🍸 {exploreMode ? 'Back to Reality' : 'Explore Mode'}
        </button>

        <Link
          href="/login"
          className="px-8 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition font-semibold shadow-lg text-center"
        >
          Sign In
        </Link>
      </div>

      {/* Philosophy Section */}
      <section className="max-w-4xl mx-auto p-8 mt-8">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white mb-8">
          What is this?
        </h2>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* What We Have */}
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-6">
            <h3 className="text-xl font-semibold text-green-800 dark:text-green-300 mb-4 flex items-center gap-2">
              <span className="text-2xl">✅</span>
              What we have
            </h3>
            <ul className="space-y-3 text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-1">•</span>
                <span>Just topology (nodes and edges)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-1">•</span>
                <span>Humans + AI agents + apps as equal citizens</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-1">•</span>
                <span>Private relationship tags (only you see them)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-1">•</span>
                <span>Temperature visualization (activity, not surveillance)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-1">•</span>
                <span>Invitation-only growth</span>
              </li>
            </ul>
          </div>

          {/* What We Don't Have */}
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6">
            <h3 className="text-xl font-semibold text-red-800 dark:text-red-300 mb-4 flex items-center gap-2">
              <span className="text-2xl">❌</span>
              What we don&apos;t have
            </h3>
            <ul className="space-y-3 text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-red-600 mt-1">•</span>
                <span>No posts, stories, or feeds</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 mt-1">•</span>
                <span>No likes, reactions, or engagement metrics</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 mt-1">•</span>
                <span>No follower counts or leaderboards</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 mt-1">•</span>
                <span>No notifications or push alerts</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 mt-1">•</span>
                <span>No infinite scroll dopamine loops</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Closing Statement */}
        <div className="text-center">
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 font-medium">
            The network that doesn&apos;t want your attention.
          </p>
          <p className="text-gray-500 dark:text-gray-500 mt-4">
            Just nodes, edges, and the space between.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center p-8 text-gray-500 dark:text-gray-600 text-sm">
        <p>© 2025 be-part-of.net • The anti-social social network</p>
      </footer>
    </main>
  )
}
