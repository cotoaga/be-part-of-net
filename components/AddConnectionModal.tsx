'use client'

import { useState, useEffect } from 'react'

interface AddConnectionModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: ConnectionFormData) => Promise<void>
}

export interface ConnectionFormData {
  type: 'person' | 'app'
  name: string
  email?: string // Person-specific
  description: string
  url: string
  endpoint_url?: string // App-specific (MCP indicator)
  label: string
}

export default function AddConnectionModal({
  isOpen,
  onClose,
  onSubmit
}: AddConnectionModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState<ConnectionFormData>({
    type: 'person',
    name: '',
    email: '',
    description: '',
    url: '',
    endpoint_url: '',
    label: ''
  })

  // Reset form when opening
  useEffect(() => {
    if (isOpen) {
      setFormData({
        type: 'person',
        name: '',
        email: '',
        description: '',
        url: '',
        endpoint_url: '',
        label: ''
      })
      setError(null)
      setIsSubmitting(false)
    }
  }, [isOpen])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, isSubmitting, onClose])

  // Handle outside click
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.classList.contains('modal-backdrop') && !isSubmitting) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, isSubmitting, onClose])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      await onSubmit(formData)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create connection')
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-backdrop fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-800 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white font-['Space_Grotesk']">
            Create Node
          </h2>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-2xl leading-none text-gray-600 dark:text-gray-400 disabled:opacity-50"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Error message */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          {/* Type selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Node Type
            </label>
            <div className="flex gap-4">
              <label className="flex-1 cursor-pointer">
                <input
                  type="radio"
                  name="type"
                  value="person"
                  checked={formData.type === 'person'}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'person' | 'app' })}
                  className="sr-only"
                />
                <div className={`px-4 py-3 rounded-lg border-2 text-center transition-colors ${
                  formData.type === 'person'
                    ? 'border-[var(--color-klein-bottle-green)] dark:border-[var(--color-deep-space-blue)] bg-green-50 dark:bg-blue-900/20 text-gray-900 dark:text-white'
                    : 'border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                }`}>
                  Person
                </div>
              </label>
              <label className="flex-1 cursor-pointer">
                <input
                  type="radio"
                  name="type"
                  value="app"
                  checked={formData.type === 'app'}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'person' | 'app' })}
                  className="sr-only"
                />
                <div className={`px-4 py-3 rounded-lg border-2 text-center transition-colors ${
                  formData.type === 'app'
                    ? 'border-[var(--color-klein-bottle-green)] dark:border-[var(--color-deep-space-blue)] bg-green-50 dark:bg-blue-900/20 text-gray-900 dark:text-white'
                    : 'border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                }`}>
                  App
                </div>
              </label>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[var(--color-klein-bottle-green)] dark:focus:ring-[var(--color-deep-space-blue)] focus:border-transparent"
              placeholder={formData.type === 'person' ? 'e.g., Alice Smith' : 'e.g., Hondius'}
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Email (only for Person) */}
          {formData.type === 'person' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email (optional)
              </label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[var(--color-klein-bottle-green)] dark:focus:ring-[var(--color-deep-space-blue)] focus:border-transparent"
                placeholder="alice@example.com"
                disabled={isSubmitting}
              />
            </div>
          )}

          {/* URL (required for App, optional for Person) */}
          {formData.type === 'app' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                URL *
              </label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[var(--color-klein-bottle-green)] dark:focus:ring-[var(--color-deep-space-blue)] focus:border-transparent"
                placeholder="https://example.com"
                required
                disabled={isSubmitting}
              />
            </div>
          )}

          {formData.type === 'person' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                URL (optional)
              </label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[var(--color-klein-bottle-green)] dark:focus:ring-[var(--color-deep-space-blue)] focus:border-transparent"
                placeholder="https://example.com"
                disabled={isSubmitting}
              />
            </div>
          )}

          {/* About/Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              About (optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[var(--color-klein-bottle-green)] dark:focus:ring-[var(--color-deep-space-blue)] focus:border-transparent"
              rows={3}
              placeholder={formData.type === 'person' ? 'Tell us about this person...' : 'What does this app do?'}
              disabled={isSubmitting}
            />
          </div>

          {/* MCP Endpoint (only for App) */}
          {formData.type === 'app' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                MCP Endpoint (optional)
              </label>
              <input
                type="text"
                value={formData.endpoint_url || ''}
                onChange={(e) => setFormData({ ...formData, endpoint_url: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[var(--color-klein-bottle-green)] dark:focus:ring-[var(--color-deep-space-blue)] focus:border-transparent font-mono text-sm"
                placeholder="mcp://example.com/service"
                disabled={isSubmitting}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                If this app has an MCP server endpoint
              </p>
            </div>
          )}

          {/* Relationship label */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              What&apos;s your relationship to this node? (optional)
            </label>
            <input
              type="text"
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[var(--color-klein-bottle-green)] dark:focus:ring-[var(--color-deep-space-blue)] focus:border-transparent"
              placeholder={formData.type === 'person' ? 'e.g., "friend", "colleague"' : 'e.g., "created", "use daily"'}
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              This label is private to you
            </p>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={
              isSubmitting ||
              !formData.name.trim() ||
              (formData.type === 'app' && !formData.url.trim())
            }
            className="w-full px-6 py-3 bg-[var(--color-klein-bottle-green)] dark:bg-[var(--color-deep-space-blue)] text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Creating Node...' : 'Create Node'}
          </button>
        </form>
      </div>
    </div>
  )
}
