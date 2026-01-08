'use client';

import { useMemo, useState } from 'react';
import type { Node, Edge } from '@/types';
import type { VisibilityInfo } from '@/lib/fogOfWar';

interface ConnectPersonPanelProps {
  sourceNodeId: string;
  nodes: Node[];
  edges: Edge[];
  visibility: Map<string, VisibilityInfo>;
  onSuccess: () => Promise<void>;
  onClose: () => void;
}

function filterConnectablePersons(
  sourceNodeId: string,
  allNodes: Node[],
  allEdges: Edge[],
  visibility: Map<string, VisibilityInfo>
): Node[] {
  // Get existing connections (bidirectional)
  const connectedNodeIds = new Set<string>();
  allEdges.forEach((edge) => {
    if (edge.from_node_id === sourceNodeId) {
      connectedNodeIds.add(edge.to_node_id);
    }
    if (edge.to_node_id === sourceNodeId) {
      connectedNodeIds.add(edge.from_node_id);
    }
  });

  return allNodes.filter((node) => {
    // Exclude self
    if (node.id === sourceNodeId) return false;

    // Only person nodes
    if (node.type !== 'person') return false;

    // Must be visible (opacity > 0)
    const visInfo = visibility.get(node.id);
    if (!visInfo || visInfo.opacity <= 0) return false;

    // Exclude already connected
    if (connectedNodeIds.has(node.id)) return false;

    return true;
  });
}

export default function ConnectPersonPanel({
  sourceNodeId,
  nodes,
  edges,
  visibility,
  onSuccess,
  onClose,
}: ConnectPersonPanelProps) {
  const [connecting, setConnecting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Get source node info
  const sourceNode = nodes.find((n) => n.id === sourceNodeId);

  // Filter connectable persons
  const connectablePersons = useMemo(() => {
    return filterConnectablePersons(sourceNodeId, nodes, edges, visibility);
  }, [sourceNodeId, nodes, edges, visibility]);

  const handleConnect = async (targetPersonId: string) => {
    try {
      setConnecting(targetPersonId);
      setError(null);

      const response = await fetch('/api/edges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from_node_id: sourceNodeId,
          to_node_id: targetPersonId,
          relation: 'knowing',
        }),
      });

      const result = await response.json();

      if (response.ok) {
        await onSuccess(); // Refetch graph
        onClose();
      } else {
        setError(result.error || 'Failed to create connection');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setConnecting(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Create a &ldquo;knowing&rdquo; connection from <strong>{sourceNode?.name}</strong> to
          another person. Only visible people without existing connections are shown.
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded">
          {error}
        </div>
      )}

      {/* Person List */}
      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {connectablePersons.length === 0 ? (
          <div className="text-center py-8 text-sm text-[var(--color-text-secondary)] italic">
            No connectable people found. All visible people are already connected.
          </div>
        ) : (
          connectablePersons.map((person) => {
            const visInfo = visibility.get(person.id);
            const hopDistance = visInfo?.hopDistance ?? 0;
            const isConnecting = connecting === person.id;

            return (
              <div
                key={person.id}
                className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-800 rounded hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                      PERSON
                    </span>
                    <span className="font-medium">{person.name}</span>
                  </div>
                  <div className="text-xs text-[var(--color-text-secondary)]">
                    {hopDistance === 0
                      ? 'Same node'
                      : hopDistance === 1
                      ? '1 hop away'
                      : `${hopDistance} hops away`}
                  </div>
                  {person.description && (
                    <div className="text-xs text-[var(--color-text-secondary)] mt-1">
                      {person.description}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleConnect(person.id)}
                  disabled={isConnecting}
                  className="btn-primary text-xs px-3 py-1 ml-3"
                >
                  {isConnecting ? 'Connecting...' : 'Connect'}
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Close Button */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
        <button onClick={onClose} className="btn-secondary w-full" disabled={!!connecting}>
          Close
        </button>
      </div>
    </div>
  );
}
