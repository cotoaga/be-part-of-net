'use client'

import { useState, useEffect } from 'react'

interface ConnectLabelModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (label: string) => void
  sourceNodeName: string
  targetNodeName: string
}

export default function ConnectLabelModal({
  isOpen,
  onClose,
  onSubmit,
  sourceNodeName,
  targetNodeName
}: ConnectLabelModalProps) {
  const [label, setLabel] = useState('')

  // Reset form when opening
  useEffect(() => {
    if (isOpen) {
      setLabel('')
    }
  }, [isOpen])

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

  // Handle outside click
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.classList.contains('modal-backdrop')) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, onClose])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(label)
  }

  if (!isOpen) return null

  return (
    <div className="modal-backdrop fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-800 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white font-['Space_Grotesk']">
            Create Connection
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-2xl leading-none text-gray-600 dark:text-gray-400"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Connection info */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-1">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <span className="font-medium">From:</span> {sourceNodeName}
            </div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <span className="font-medium">To:</span> {targetNodeName}
            </div>
          </div>

          {/* Label input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Label (optional)
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[var(--color-klein-bottle-green)] dark:focus:ring-[var(--color-deep-space-blue)] focus:border-transparent"
              placeholder='e.g., "collaborator", "friend", "uses"'
              autoFocus
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              This label is private - only you can see it
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-[var(--color-klein-bottle-green)] dark:bg-[var(--color-deep-space-blue)] text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              Connect
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
