'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Node } from '@/types';

interface EditPanelProps {
  nodeId: string;
  onSuccess: () => Promise<void>;
  onClose: () => void;
}

export default function EditPanel({ nodeId, onSuccess, onClose }: EditPanelProps) {
  const [node, setNode] = useState<Node | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [url, setUrl] = useState('');

  const fetchNode = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch node directly by ID
      const response = await fetch(`/api/nodes/${nodeId}`);
      const result = await response.json();

      if (response.ok && result.node) {
        const nodeData = result.node;
        setNode(nodeData);
        setName(nodeData.name || '');
        setDescription(nodeData.description || '');
        setEmail(nodeData.email || '');
        setUrl(nodeData.url || '');
      } else {
        setError(result.error || 'Node not found');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }, [nodeId]);

  useEffect(() => {
    fetchNode();
  }, [fetchNode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    if (node?.type === 'person' && !email.trim()) {
      setError('Email is required for person nodes');
      return;
    }

    if ((node?.type === 'url' || node?.type === 'mcp') && !url.trim()) {
      setError('URL is required');
      return;
    }

    try {
      setSubmitting(true);

      const body: any = {
        name: name.trim(),
        description: description.trim() || undefined,
      };

      if (node?.type === 'person') {
        body.email = email.trim();
      } else {
        body.url = url.trim();
      }

      const response = await fetch(`/api/nodes/${nodeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (response.ok) {
        await onSuccess();
        onClose();
      } else {
        setError(result.error || 'Failed to update node');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-sm text-[var(--color-text-secondary)]">Loading...</div>
      </div>
    );
  }

  if (!node) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-2">
        <div className="text-sm text-red-500">{error || 'Node not found'}</div>
        <button onClick={fetchNode} className="btn-secondary text-sm">
          Retry
        </button>
      </div>
    );
  }

  const typeBadgeColor =
    node.type === 'person'
      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
      : node.type === 'url'
      ? 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300'
      : 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Type Badge */}
      <div className="flex items-center gap-2">
        <span className={`px-2 py-1 rounded text-xs font-medium ${typeBadgeColor}`}>
          {node.type.toUpperCase()}
        </span>
        <span className="text-xs text-[var(--color-text-secondary)]">
          Editing node details
        </span>
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
          placeholder="Enter name"
          required
          maxLength={100}
        />
      </div>

      {/* Email (person only) */}
      {node.type === 'person' && (
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
            placeholder="user@example.com"
            required
          />
        </div>
      )}

      {/* URL (url/mcp only) */}
      {(node.type === 'url' || node.type === 'mcp') && (
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
        </div>
      )}

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
        <button type="submit" className="btn-primary flex-1" disabled={submitting}>
          {submitting ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}
