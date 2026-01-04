'use client';

import { useState } from 'react';
import type { Node } from '@/types';

interface CreatePanelProps {
  centerNodeId: string;
  onSuccess: (newNodeId: string) => Promise<void>;
  onSwitchToUse: () => void;
  onClose: () => void;
}

export default function CreatePanel({
  centerNodeId,
  onSuccess,
  onSwitchToUse,
  onClose,
}: CreatePanelProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [duplicateNode, setDuplicateNode] = useState<Node | null>(null);

  // Form fields
  const [type, setType] = useState<'url' | 'mcp'>('url');
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');

  const checkDuplicate = async (urlToCheck: string): Promise<Node | null> => {
    try {
      const response = await fetch(`/api/nodes-search?url=${encodeURIComponent(urlToCheck)}`);
      const result = await response.json();

      if (response.ok && result.nodes?.length > 0) {
        return result.nodes[0];
      }
    } catch (err) {
      console.error('Duplicate check failed:', err);
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setDuplicateNode(null);

    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    if (!url.trim()) {
      setError('URL is required');
      return;
    }

    try {
      setSubmitting(true);

      // Check for duplicate URL
      const existing = await checkDuplicate(url.trim());
      if (existing) {
        setDuplicateNode(existing);
        setSubmitting(false);
        return;
      }

      // Step 1: Create node
      const nodeResponse = await fetch('/api/nodes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          name: name.trim(),
          url: url.trim(),
          description: description.trim() || undefined,
        }),
      });

      const nodeResult = await nodeResponse.json();

      if (!nodeResponse.ok) {
        if (nodeResponse.status === 409 && nodeResult.existingNodeId) {
          // Duplicate detected by backend
          const existing = await checkDuplicate(url.trim());
          if (existing) {
            setDuplicateNode(existing);
          } else {
            setError('A node with this URL already exists');
          }
        } else {
          setError(nodeResult.error || 'Failed to create node');
        }
        setSubmitting(false);
        return;
      }

      const newNodeId = nodeResult.data.id;

      // Step 2: Create 'created' edge
      const edgeResponse = await fetch('/api/edges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from_node_id: centerNodeId,
          to_node_id: newNodeId,
          relation: 'created',
        }),
      });

      const edgeResult = await edgeResponse.json();

      if (!edgeResponse.ok) {
        setError(edgeResult.error || 'Node created but failed to create edge');
        setSubmitting(false);
        return;
      }

      // Success!
      await onSuccess(newNodeId);
      onClose();
    } catch (err) {
      setError('Network error');
      setSubmitting(false);
    }
  };

  const handleUseExisting = () => {
    onSwitchToUse();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="text-sm text-[var(--color-text-secondary)]">
        Create a new URL or MCP server resource. You will be marked as the creator.
      </div>

      {/* Type Selector */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Type <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              value="url"
              checked={type === 'url'}
              onChange={(e) => setType(e.target.value as 'url')}
              className="w-4 h-4"
            />
            <span className="text-sm">URL (Web Resource)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              value="mcp"
              checked={type === 'mcp'}
              onChange={(e) => setType(e.target.value as 'mcp')}
              className="w-4 h-4"
            />
            <span className="text-sm">MCP (AI Server)</span>
          </label>
        </div>
      </div>

      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">
          Name <span className="text-red-500">*</span>
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input"
          placeholder={type === 'url' ? 'My Website' : 'My MCP Server'}
          required
          maxLength={100}
          autoFocus
        />
      </div>

      {/* URL */}
      <div>
        <label htmlFor="url" className="block text-sm font-medium mb-1">
          URL <span className="text-red-500">*</span>
        </label>
        <input
          id="url"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="input font-mono text-sm"
          placeholder="https://example.com"
          required
        />
        <div className="text-xs text-[var(--color-text-secondary)] mt-1">
          Must be unique in the network
        </div>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-1">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="input resize-none"
          rows={3}
          placeholder="Optional description"
          maxLength={500}
        />
        <div className="text-xs text-[var(--color-text-secondary)] mt-1 text-right">
          {description.length}/500
        </div>
      </div>

      {/* Duplicate Warning */}
      {duplicateNode && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded p-3 space-y-2">
          <div className="text-sm text-yellow-800 dark:text-yellow-300 font-medium">
            This URL already exists
          </div>
          <div className="text-xs text-yellow-700 dark:text-yellow-400">
            <strong>{duplicateNode.name}</strong> ({duplicateNode.type})
          </div>
          <button
            type="button"
            onClick={handleUseExisting}
            className="btn-secondary w-full text-sm"
          >
            Use Existing Resource
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-800">
        <button
          type="button"
          onClick={onClose}
          className="btn-secondary flex-1"
          disabled={submitting}
        >
          Cancel
        </button>
        <button type="submit" className="btn-primary flex-1" disabled={submitting || !!duplicateNode}>
          {submitting ? 'Creating...' : 'Create Resource'}
        </button>
      </div>
    </form>
  );
}
