'use client'

import { useState, useEffect } from 'react'

interface HondiusInterfaceProps {
  isOpen: boolean
  onClose: () => void
}

type Tab = 'classify' | 'curate'

interface ClassifyFormData {
  title: string
  author: string
  contentType: 'book' | 'article' | 'concept'
  context: string
}

interface CurateFormData {
  url: string
  title: string
  context: string
}

interface ClassificationResult {
  classification: {
    type: string
    category: string
    methodology: string | null
    themes: string[]
  }
  derived: {
    tetrahedron: string
    cynefin: string
  }
  confidence: 'high' | 'medium' | 'low'
  reasoning: string
}

interface CurationResult {
  tier: 'READ-IT' | 'ARCHIVE' | 'DUMP-IT'
  reasoning: string
  personality_voice: 'TARS' | 'Marvin' | 'Eddie'
  snark: string
}

export default function HondiusInterface({ isOpen, onClose }: HondiusInterfaceProps) {
  const [activeTab, setActiveTab] = useState<Tab>('classify')
  const [isLoading, setIsLoading] = useState(false)

  // Classify form state
  const [classifyForm, setClassifyForm] = useState<ClassifyFormData>({
    title: '',
    author: '',
    contentType: 'book',
    context: ''
  })
  const [classifyResult, setClassifyResult] = useState<ClassificationResult | null>(null)

  // Curate form state
  const [curateForm, setCurateForm] = useState<CurateFormData>({
    url: '',
    title: '',
    context: ''
  })
  const [curateResult, setCurateResult] = useState<CurationResult | null>(null)

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // Reset form when opening
  useEffect(() => {
    if (isOpen) {
      setClassifyResult(null)
      setCurateResult(null)
    }
  }, [isOpen])

  const handleClassifySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // STUB: Simulated response
    await new Promise(resolve => setTimeout(resolve, 1500))

    setClassifyResult({
      classification: {
        type: 'Story',
        category: 'Space Opera',
        methodology: null,
        themes: ['consciousness', 'ai-impact', 'civilization', 'future-scenarios', 'ethics']
      },
      derived: {
        tetrahedron: 'Narrative',
        cynefin: 'N/A'
      },
      confidence: 'high',
      reasoning: `Literary SF masterpiece using Canterbury Tales frame structure. ${classifyForm.title} blends philosophy, theology, and hard SF into a meditation on consciousness and AI ethics. The Hyperion Cantos explores civilization's relationship with artificial intelligence through multiple narrative perspectives.`
    })

    setIsLoading(false)
  }

  const handleCurateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // STUB: Simulated response
    await new Promise(resolve => setTimeout(resolve, 1500))

    setCurateResult({
      tier: 'READ-IT',
      reasoning: 'Original research with novel synthesis of existing knowledge. Demonstrates deep understanding of domain and provides actionable insights.',
      personality_voice: 'TARS',
      snark: 'Finally, someone who actually did the work instead of regurgitating press releases.'
    })

    setIsLoading(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-y-0 right-0 w-[600px] bg-white dark:bg-gray-900 shadow-2xl z-50 border-l border-gray-200 dark:border-gray-800 flex flex-col animate-slide-in">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white font-['Space_Grotesk']">
            Hondius
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            KHAOS Classification & Curation Agent
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-2xl leading-none text-gray-600 dark:text-gray-400"
          aria-label="Close"
        >
          ×
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={() => {
            setActiveTab('classify')
            setClassifyResult(null)
          }}
          className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
            activeTab === 'classify'
              ? 'text-[var(--color-klein-bottle-green)] dark:text-[var(--color-deep-space-blue)] border-b-2 border-current'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Classify
        </button>
        <button
          onClick={() => {
            setActiveTab('curate')
            setCurateResult(null)
          }}
          className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
            activeTab === 'curate'
              ? 'text-[var(--color-klein-bottle-green)] dark:text-[var(--color-deep-space-blue)] border-b-2 border-current'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Curate
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'classify' && (
          <div className="space-y-6">
            <form onSubmit={handleClassifySubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={classifyForm.title}
                  onChange={(e) => setClassifyForm({ ...classifyForm, title: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[var(--color-klein-bottle-green)] dark:focus:ring-[var(--color-deep-space-blue)] focus:border-transparent"
                  placeholder="Hyperion"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Author
                </label>
                <input
                  type="text"
                  value={classifyForm.author}
                  onChange={(e) => setClassifyForm({ ...classifyForm, author: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[var(--color-klein-bottle-green)] dark:focus:ring-[var(--color-deep-space-blue)] focus:border-transparent"
                  placeholder="Dan Simmons"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Content Type
                </label>
                <select
                  value={classifyForm.contentType}
                  onChange={(e) => setClassifyForm({ ...classifyForm, contentType: e.target.value as 'book' | 'article' | 'concept' })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[var(--color-klein-bottle-green)] dark:focus:ring-[var(--color-deep-space-blue)] focus:border-transparent"
                >
                  <option value="book">Book</option>
                  <option value="article">Article</option>
                  <option value="concept">Concept</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Context (optional)
                </label>
                <textarea
                  value={classifyForm.context}
                  onChange={(e) => setClassifyForm({ ...classifyForm, context: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[var(--color-klein-bottle-green)] dark:focus:ring-[var(--color-deep-space-blue)] focus:border-transparent"
                  rows={3}
                  placeholder="Additional context about the work..."
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !classifyForm.title}
                className="w-full px-6 py-3 bg-[var(--color-klein-bottle-green)] dark:bg-[var(--color-deep-space-blue)] text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Classifying...' : 'Classify'}
              </button>
            </form>

            {classifyResult && (
              <div className="mt-6 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Classification Result
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    classifyResult.confidence === 'high'
                      ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                      : classifyResult.confidence === 'medium'
                      ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                      : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                  }`}>
                    {classifyResult.confidence} confidence
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Type:</span>
                    <span className="ml-2 text-gray-900 dark:text-white">{classifyResult.classification.type}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Category:</span>
                    <span className="ml-2 text-gray-900 dark:text-white">{classifyResult.classification.category}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Themes:</span>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {classifyResult.classification.themes.map((theme) => (
                        <span
                          key={theme}
                          className="px-2 py-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded text-xs text-gray-700 dark:text-gray-300"
                        >
                          {theme}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Reasoning:</span>
                    <p className="mt-2 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      {classifyResult.reasoning}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'curate' && (
          <div className="space-y-6">
            <form onSubmit={handleCurateSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  URL *
                </label>
                <input
                  type="url"
                  value={curateForm.url}
                  onChange={(e) => setCurateForm({ ...curateForm, url: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[var(--color-klein-bottle-green)] dark:focus:ring-[var(--color-deep-space-blue)] focus:border-transparent"
                  placeholder="https://example.com/article"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title (optional override)
                </label>
                <input
                  type="text"
                  value={curateForm.title}
                  onChange={(e) => setCurateForm({ ...curateForm, title: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[var(--color-klein-bottle-green)] dark:focus:ring-[var(--color-deep-space-blue)] focus:border-transparent"
                  placeholder="Article title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Context (optional)
                </label>
                <textarea
                  value={curateForm.context}
                  onChange={(e) => setCurateForm({ ...curateForm, context: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[var(--color-klein-bottle-green)] dark:focus:ring-[var(--color-deep-space-blue)] focus:border-transparent"
                  rows={3}
                  placeholder="Additional context about the source..."
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !curateForm.url}
                className="w-full px-6 py-3 bg-[var(--color-klein-bottle-green)] dark:bg-[var(--color-deep-space-blue)] text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Curating...' : 'Curate'}
              </button>
            </form>

            {curateResult && (
              <div className="mt-6 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Curation Result
                  </h3>
                  <span className={`px-4 py-2 rounded-lg text-sm font-bold ${
                    curateResult.tier === 'READ-IT'
                      ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                      : curateResult.tier === 'ARCHIVE'
                      ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                  }`}>
                    {curateResult.tier === 'READ-IT' ? '🔥 READ-IT' : curateResult.tier === 'ARCHIVE' ? '📦 ARCHIVE' : '🗑️ DUMP-IT'}
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Reasoning:</span>
                    <p className="mt-2 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      {curateResult.reasoning}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-gray-300 dark:border-gray-600">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {curateResult.personality_voice} says:
                    </span>
                    <p className="mt-2 text-sm italic text-gray-700 dark:text-gray-300 leading-relaxed">
                      "{curateResult.snark}"
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer hint */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Press <kbd className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded text-xs">Esc</kbd> to close
        </p>
      </div>
    </div>
  )
}
