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
      <header className="p-8 md:p-12 text-center">
        <h1 className="text-5xl md:text-6xl font-display font-bold text-gray-900 dark:text-white mb-4">
          be-part-of.net
        </h1>
        <p className="text-2xl md:text-3xl font-display font-semibold text-gray-900 dark:text-white mb-8">
          The Anti-Social Social Network
        </p>
        <p className="text-lg md:text-xl font-sans text-gray-700 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
          No posts. No likes. No influencer circus. No doom-scrolling.<br />
          Just the network of connections that matter to you.
        </p>
      </header>

      {/* Divider */}
      <div className="max-w-4xl mx-auto border-t border-gray-300 dark:border-gray-700 my-8"></div>

      {/* The Idea Section */}
      <section className="max-w-4xl mx-auto px-8 py-12">
        <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 dark:text-white mb-8">
          The Idea
        </h2>

        <div className="space-y-8 font-sans text-gray-700 dark:text-gray-300">
          {/* Nodes */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Nodes: People, services, and AIs. Equal citizens in your network.
            </h3>
            <p className="mb-2">Each node has:</p>
            <ul className="space-y-2 ml-4">
              <li className="flex items-start gap-2">
                <span className="text-klein-bottle-green dark:text-deep-space-blue mt-1">•</span>
                <span>A name (one string - fill it however you want)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-klein-bottle-green dark:text-deep-space-blue mt-1">•</span>
                <span>A URL (optional - link to your corner of the web)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-klein-bottle-green dark:text-deep-space-blue mt-1">•</span>
                <span>An about section (optional - say something, or don&apos;t)</span>
              </li>
            </ul>
            <p className="mt-3 text-soft-gray dark:text-gray-400 italic">
              No profile pictures. You&apos;re not a thumbnail.
            </p>
          </div>

          {/* Edges */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Edges: Connections you create. Extend your network as you see fit.
            </h3>
            <p className="text-soft-gray dark:text-gray-400">
              Your graph, your sovereignty.
            </p>
          </div>

          {/* Identity */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Identity: You sign in with an email. Whether anyone else sees it? Your call.
            </h3>
          </div>

          {/* Everything Else */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Everything Else: Be part of it and let&apos;s shape it together.
            </h3>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-4xl mx-auto border-t border-gray-300 dark:border-gray-700 my-8"></div>

      {/* 3D Graph Visualization - Zaphod's Zoo Demo */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-12">
        <div className="relative h-[500px] md:h-[600px] border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-lg bg-white dark:bg-gray-900">
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

        {/* Graph hint */}
        <div className="text-center mt-4">
          <p className="font-sans text-soft-gray dark:text-gray-400 text-sm">
            Click nodes to explore • Fog of war hides distant connections
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="max-w-4xl mx-auto border-t border-gray-300 dark:border-gray-700 my-8"></div>

      {/* Explore Section */}
      <section className="max-w-4xl mx-auto px-8 py-12">
        <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 dark:text-white mb-8">
          Explore
        </h2>

        <div className="space-y-6">
          {/* Zaphod's Network CTA */}
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 hover:border-klein-bottle-green dark:hover:border-deep-space-blue transition-colors">
            <h3 className="text-xl font-sans font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <span className="text-klein-bottle-green dark:text-deep-space-blue">→</span>
              Zaphod&apos;s Network
            </h3>
            <p className="font-sans text-gray-700 dark:text-gray-300">
              Wander through a demo. Hitchhiker&apos;s Guide fans, you know the crew.
            </p>
            <p className="font-sans text-soft-gray dark:text-gray-400 text-sm mt-2 italic">
              (Scroll up to explore the graph above)
            </p>
          </div>

          {/* Your Network CTA */}
          <Link href="/login">
            <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg p-6 hover:border-klein-bottle-green dark:hover:border-deep-space-blue transition-colors cursor-pointer">
              <h3 className="text-xl font-sans font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <span className="text-klein-bottle-green dark:text-deep-space-blue">→</span>
                Your Network
              </h3>
              <p className="font-sans text-gray-700 dark:text-gray-300">
                Sign up and start building your own.
              </p>
            </div>
          </Link>
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
