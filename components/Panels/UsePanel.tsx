'use client';

import { useState, useEffect, useRef } from 'react';
import type { Node } from '@/types';

interface UsePanelProps {
  centerNodeId: string;
  onSuccess: () => Promise<void>;
  onClose: () => void;
}

export default function UsePanel({ centerNodeId, onSuccess, onClose }: UsePanelProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Node[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connecting, setConnecting] = useState<string | null>(null);
  const debounceTimer = useRef<NodeJS.Timeout>();

  // Debounced search
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (!query.trim()) {
      setResults([]);
      return;
    }

    debounceTimer.current = setTimeout(() => {
      performSearch(query.trim());
    }, 300);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [query]);

  const performSearch = async (searchQuery: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/nodes-search?q=${encodeURIComponent(searchQuery)}&type=url,mcp`
      );
      const result = await response.json();

      if (response.ok) {
        setResults(result.nodes || []);
      } else {
        setError(result.error || 'Search failed');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleUseNode = async (targetNodeId: string) => {
    try {
      setConnecting(targetNodeId);
      setError(null);

      // Validate centerNodeId
      if (!centerNodeId) {
        setError('No node selected. Please select a node first.');
        setConnecting(null);
        return;
      }

      // Create 'using' edge
      const response = await fetch('/api/edges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from_node_id: centerNodeId,
          to_node_id: targetNodeId,
          relation: 'using',
        }),
      });

      const result = await response.json();

      if (response.ok) {
        await onSuccess();
        onClose();
      } else {
        // Show detailed validation errors if available
        if (result.details && Array.isArray(result.details)) {
          const errorMsg = result.details.map((d: any) => `${d.field}: ${d.message}`).join(', ');
          setError(errorMsg || result.error || 'Failed to create connection');
        } else {
          setError(result.error || 'Failed to create connection');
        }
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setConnecting(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-sm text-[var(--color-text-secondary)]">
        Search for existing URLs or MCP servers to mark as &ldquo;using&rdquo; from the current node.
      </div>

      {/* Search Input */}
      <div>
        <label htmlFor="search" className="block text-sm font-medium mb-1">
          Search Resources
        </label>
        <input
          id="search"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="input"
          placeholder="Search by name or URL..."
          autoFocus
        />
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-4 text-sm text-[var(--color-text-secondary)]">
          Searching...
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded">
          {error}
        </div>
      )}

      {/* Results */}
      {!loading && query.trim() && results.length === 0 && (
        <div className="text-center py-8 text-sm text-[var(--color-text-secondary)]">
          No resources found matching {`"${query}"`}
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wide">
            {results.length} Result{results.length !== 1 ? 's' : ''}
          </div>
          {results.map((node) => {
            const isConnecting = connecting === node.id;
            const typeBadgeColor =
              node.type === 'url'
                ? 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300'
                : 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300';

            return (
              <div
                key={node.id}
                className="border border-gray-200 dark:border-gray-800 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${typeBadgeColor}`}>
                        {node.type.toUpperCase()}
                      </span>
                      <h4 className="font-medium text-sm truncate">{node.name}</h4>
                    </div>
                    {node.url && (
                      <a
                        href={node.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-[var(--color-primary)] hover:underline font-mono break-all block mb-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {node.url}
                      </a>
                    )}
                    {node.description && (
                      <p className="text-xs text-[var(--color-text-secondary)] line-clamp-2">
                        {node.description}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleUseNode(node.id)}
                    disabled={isConnecting}
                    className="btn-primary text-xs px-3 py-1 whitespace-nowrap flex-shrink-0"
                  >
                    {isConnecting ? 'Using...' : 'Use'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Close Button */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
        <button onClick={onClose} className="btn-secondary w-full">
          Close
        </button>
      </div>
    </div>
  );
}
