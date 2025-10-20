'use client'

import Link from 'next/link'
import dynamic from 'next/dynamic'
import CivilizedLayout from '@/components/CivilizedLayout'
import ThemeToggle from '@/components/ThemeToggle'

// Import GraphVisualization dynamically
const GraphVisualization = dynamic(() => import('@/components/GraphVisualization'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full text-soft-gray">
      <p className="text-lg font-sans">Loading Zaphod&apos;s Zoo...</p>
    </div>
  ),
})

export default function PublicLanding() {

  return (
    <CivilizedLayout>
      {/* Hero Section */}
      <header className="p-8 text-center">
        <h1 className="text-5xl md:text-6xl font-display font-bold text-gray-900 dark:text-white mb-2">
          be-part-of.net
        </h1>
        <p className="text-xl md:text-2xl font-sans text-soft-gray dark:text-gray-400">
          The anti-social social network
        </p>
      </header>

      {/* 3D Graph Visualization - Zaphod's Zoo Demo */}
      <div className="relative h-[500px] md:h-[600px] border border-gray-200 dark:border-gray-700 mx-4 md:mx-8 rounded-xl overflow-hidden shadow-lg bg-white dark:bg-gray-900">
        <GraphVisualization isDemoMode={true} />

        {/* Top-right controls: Theme Toggle + Sign In */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/login"
            className="px-6 py-2 bg-klein-bottle-green dark:bg-deep-space-blue text-white rounded-lg hover:opacity-90 transition font-sans font-semibold shadow-lg"
          >
            Sign In
          </Link>
        </div>
      </div>

      {/* Info Text */}
      <div className="text-center p-4">
        <p className="font-sans text-soft-gray dark:text-gray-400 text-sm">
          Click nodes to explore the graph | there is a &apos;fog of war&apos; that hides nodes far away, do not hold back and traverse the graph
        </p>
      </div>

      {/* Philosophy Section */}
      <section className="max-w-4xl mx-auto p-8 mt-8">
        <h2 className="text-3xl md:text-4xl font-display font-bold text-center text-gray-900 dark:text-white mb-8">
          What is this?
        </h2>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* What We Have */}
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
            <h3 className="text-xl font-sans font-semibold text-green-800 dark:text-green-300 mb-4 flex items-center gap-2">
              <span className="text-2xl">✅</span>
              What we have
            </h3>
            <ul className="space-y-3 font-sans text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-klein-bottle-green mt-1">•</span>
                <span>Just topology (nodes and edges)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-klein-bottle-green mt-1">•</span>
                <span>Humans + AI agents + apps as equal citizens</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-klein-bottle-green mt-1">•</span>
                <span>Private relationship tags (only you see them)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-klein-bottle-green mt-1">•</span>
                <span>Temperature visualization (activity, not surveillance)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-klein-bottle-green mt-1">•</span>
                <span>Invitation-only growth</span>
              </li>
            </ul>
          </div>

          {/* What We Don't Have */}
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <h3 className="text-xl font-sans font-semibold text-red-800 dark:text-red-300 mb-4 flex items-center gap-2">
              <span className="text-2xl">❌</span>
              What we don&apos;t have
            </h3>
            <ul className="space-y-3 font-sans text-gray-700 dark:text-gray-300">
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
          <p className="text-xl md:text-2xl font-sans text-soft-gray dark:text-gray-400 font-medium">
            The network that doesn&apos;t want your attention.
          </p>
          <p className="font-sans text-soft-gray dark:text-gray-500 mt-4">
            Just nodes, edges, and the space between.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center p-8 text-soft-gray dark:text-gray-600 text-sm font-sans space-y-2">
        <p>
          © 2025 be-part-of.net | Ideas want to be free! Content under{' '}
          <a
            href="https://creativecommons.org/licenses/by-sa/4.0/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-klein-bottle-green dark:hover:text-deep-space-blue transition"
          >
            CC BY-SA 4.0
          </a>
          {' '}| Use it, improve it, share it.
        </p>
        <p>
          A gimmick from{' '}
          <a
            href="https://cotoaga.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-klein-bottle-green dark:hover:text-deep-space-blue transition"
          >
            cotoaga.ai
          </a>
          {' '}which is a theme within{' '}
          <a
            href="https://cotoaga.net"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-klein-bottle-green dark:hover:text-deep-space-blue transition"
          >
            cotoaga.net
          </a>
        </p>
      </footer>
    </CivilizedLayout>
  )
}
