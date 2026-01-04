'use client';

import { useState, useMemo } from 'react';
import type { Node, RelationType } from '@/types';

interface ConnectPanelProps {
  sourceNode: Node;
  targetNode: Node;
  onSuccess: () => Promise<void>;
  onClose: () => void;
}

// Relation type validation based on node types
function getValidRelations(sourceType: string, targetType: string): RelationType[] {
  const relations: RelationType[] = [];

  if (sourceType === 'person' && targetType === 'person') {
    relations.push('knowing', 'working_with');
  }

  if (sourceType === 'person' && (targetType === 'url' || targetType === 'mcp')) {
    relations.push('using');
  }

  return relations;
}

const relationLabels: Record<RelationType, { label: string; description: string }> = {
  invited: { label: 'Invited', description: 'Person invited another person' },
  knowing: { label: 'Knowing', description: 'Personal acquaintance or friend' },
  working_with: { label: 'Working With', description: 'Professional collaboration' },
  created: { label: 'Created', description: 'Created this resource' },
  using: { label: 'Using', description: 'Uses this resource' },
};

export default function ConnectPanel({
  sourceNode,
  targetNode,
  onSuccess,
  onClose,
}: ConnectPanelProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Determine valid relations based on node types
  const validRelations = useMemo(
    () => getValidRelations(sourceNode.type, targetNode.type),
    [sourceNode.type, targetNode.type]
  );

  const [selectedRelation, setSelectedRelation] = useState<RelationType | null>(
    validRelations[0] || null
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedRelation) {
      setError('Please select a relation type');
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch('/api/edges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from_node_id: sourceNode.id,
          to_node_id: targetNode.id,
          relation: selectedRelation,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        await onSuccess();
        onClose();
      } else {
        setError(result.error || 'Failed to create connection');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setSubmitting(false);
    }
  };

  if (validRelations.length === 0) {
    return (
      <div className="space-y-4">
        <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-4 rounded">
          Cannot connect these node types. Invalid combination: {sourceNode.type} → {targetNode.type}
        </div>
        <button onClick={onClose} className="btn-secondary w-full">
          Close
        </button>
      </div>
    );
  }

  const sourceTypeBadgeColor =
    sourceNode.type === 'person'
      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
      : sourceNode.type === 'url'
      ? 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300'
      : 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300';

  const targetTypeBadgeColor =
    targetNode.type === 'person'
      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
      : targetNode.type === 'url'
      ? 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300'
      : 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Connection Preview */}
      <div className="space-y-3">
        <div className="text-sm font-medium text-[var(--color-text-secondary)]">
          Create Connection
        </div>

        {/* Source Node */}
        <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${sourceTypeBadgeColor}`}>
              {sourceNode.type.toUpperCase()}
            </span>
            <span className="text-xs text-[var(--color-text-secondary)]">From</span>
          </div>
          <div className="font-medium">{sourceNode.name}</div>
        </div>

        {/* Arrow */}
        <div className="flex justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-[var(--color-primary)]"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <polyline points="19 12 12 19 5 12" />
          </svg>
        </div>

        {/* Target Node */}
        <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${targetTypeBadgeColor}`}>
              {targetNode.type.toUpperCase()}
            </span>
            <span className="text-xs text-[var(--color-text-secondary)]">To</span>
          </div>
          <div className="font-medium">{targetNode.name}</div>
        </div>
      </div>

      {/* Relation Selector */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Relation Type <span className="text-red-500">*</span>
        </label>
        <div className="space-y-2">
          {validRelations.map((relation) => {
            const info = relationLabels[relation];
            return (
              <label
                key={relation}
                className="flex items-start gap-3 p-3 border border-gray-200 dark:border-gray-800 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
              >
                <input
                  type="radio"
                  value={relation}
                  checked={selectedRelation === relation}
                  onChange={(e) => setSelectedRelation(e.target.value as RelationType)}
                  className="mt-0.5 w-4 h-4 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{info.label}</div>
                  <div className="text-xs text-[var(--color-text-secondary)]">
                    {info.description}
                  </div>
                </div>
              </label>
            );
          })}
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
          {submitting ? 'Connecting...' : 'Create Connection'}
        </button>
      </div>
    </form>
  );
}
