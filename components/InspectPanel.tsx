'use client'

import { useEffect } from 'react'
import type { NodeType } from '@/types/graph'

interface InspectPanelProps {
  isOpen: boolean
  onClose: () => void
  node: {
    id: string
    name: string
    type: NodeType
    description?: string | null
    url?: string | null
    endpoint_url?: string | null
    confirmed?: boolean
    controlled_by?: string[]
  } | null
  currentUserId: string | null
  isEditMode?: boolean
  isCenteredNode?: boolean
  onAddConnection?: () => void
  onConnect?: () => void
  onDeleteNode?: (nodeId: string) => void
  connections?: {
    outgoing: Array<{ id: string; name: string }>
    incoming: Array<{ id: string; name: string }>
  }
}

export default function InspectPanel({
  isOpen,
  onClose,
  node,
  currentUserId,
  isEditMode = false,
  isCenteredNode = false,
  onAddConnection,
  onConnect,
  onDeleteNode,
  connections
}: InspectPanelProps) {
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
      // Check if click is outside panel (on backdrop)
      if (target.classList.contains('inspect-panel-backdrop')) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, onClose])

  if (!isOpen || !node) return null

  // Determine ownership status
  const isOwnNode = currentUserId && node.controlled_by?.includes(currentUserId)
  const ownershipText = isOwnNode ? 'you' : null

  // Format node type for display
  const typeDisplay = node.type || 'unknown'

  return (
    <div className="inspect-panel-backdrop fixed inset-0 z-40 bg-black/20 dark:bg-black/40">
      <div className="fixed inset-y-0 right-0 w-full sm:w-[400px] bg-white dark:bg-gray-900 shadow-2xl z-50 border-l border-gray-200 dark:border-gray-800 flex flex-col animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white font-['Space_Grotesk'] truncate">
              {node.name}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {typeDisplay}
              {ownershipText && (
                <>
                  {' · '}
                  <span className="text-[var(--color-klein-bottle-green)] dark:text-[var(--color-deep-space-blue)] font-medium">
                    {ownershipText}
                  </span>
                </>
              )}
            </p>
          </div>
          <button
            onClick={onClose}
            className="ml-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-2xl leading-none text-gray-600 dark:text-gray-400 flex-shrink-0"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Description */}
          {node.description && (
            <div>
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                Description
              </h3>
              <p className="text-gray-900 dark:text-white text-sm leading-relaxed">
                {node.description}
              </p>
            </div>
          )}

          {/* URL */}
          {node.url && (
            <div>
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                URL
              </h3>
              <a
                href={node.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[var(--color-klein-bottle-green)] dark:text-[var(--color-deep-space-blue)] hover:underline break-all"
              >
                {node.url}
              </a>
            </div>
          )}

          {/* Endpoint URL (for MCP) */}
          {node.endpoint_url && (
            <div>
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                Endpoint
              </h3>
              <code className="text-sm text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded break-all block">
                {node.endpoint_url}
              </code>
            </div>
          )}

          {/* Unconfirmed status */}
          {node.type === 'person' && node.confirmed === false && (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                This person has been invited but hasn&apos;t claimed their node yet.
              </p>
            </div>
          )}

          {/* Connections Inspector */}
          {connections && (connections.outgoing.length > 0 || connections.incoming.length > 0) && (
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
                Connections
              </h3>

              {/* Outgoing connections */}
              {connections.outgoing.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-gray-500 dark:text-gray-500 mb-2 uppercase tracking-wider">
                    Outgoing ({connections.outgoing.length})
                  </p>
                  <div className="space-y-1">
                    {connections.outgoing.map((conn) => (
                      <div
                        key={conn.id}
                        className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded"
                      >
                        → {conn.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Incoming connections */}
              {connections.incoming.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mb-2 uppercase tracking-wider">
                    Incoming ({connections.incoming.length})
                  </p>
                  <div className="space-y-1">
                    {connections.incoming.map((conn) => (
                      <div
                        key={conn.id}
                        className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded"
                      >
                        ← {conn.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          {(isEditMode || isOwnNode) && (onConnect || onAddConnection || onDeleteNode) && (
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
              {/* Connect Button - visible in edit mode, for non-center nodes */}
              {isEditMode && !isCenteredNode && onConnect && (
                <button
                  onClick={onConnect}
                  className="w-full px-6 py-3 bg-[var(--color-klein-bottle-green)] dark:bg-[var(--color-deep-space-blue)] text-white rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                    />
                  </svg>
                  Connect
                </button>
              )}

              {/* Add Connection - only for nodes you control */}
              {isOwnNode && onAddConnection && (
                <button
                  onClick={onAddConnection}
                  className="w-full px-6 py-3 bg-[var(--color-klein-bottle-green)] dark:bg-[var(--color-deep-space-blue)] text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                >
                  + Add Connection
                </button>
              )}

              {/* Delete Button - only for app nodes you control (edit mode) */}
              {isEditMode && isOwnNode && onDeleteNode && node.type === 'app' && (
                <button
                  onClick={() => {
                    if (window.confirm(`Delete "${node.name}"? This will remove the node and all its connections.`)) {
                      onDeleteNode(node.id)
                      onClose()
                    }
                  }}
                  className="w-full px-6 py-3 bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                >
                  Delete Node
                </button>
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
    </div>
  )
}
