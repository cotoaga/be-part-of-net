'use client';

import { useEffect, useState } from 'react';
import type { Node, Edge } from '@/types';

interface InspectorPanelProps {
  nodeId: string;
  onConnect: () => void;
  onEdit: () => void;
  onDelete: () => Promise<void>;
  onRefetch: () => Promise<void>;
}

interface NodeWithEdges {
  node: Node;
  incoming: Edge[];
  outgoing: Edge[];
}

export default function InspectorPanel({
  nodeId,
  onConnect,
  onEdit,
  onDelete,
  onRefetch,
}: InspectorPanelProps) {
  const [data, setData] = useState<NodeWithEdges | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchNodeData();
  }, [nodeId]);

  const fetchNodeData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/nodes/${nodeId}/edges`);
      const result = await response.json();

      if (response.ok) {
        setData(result.data);
      } else {
        setError(result.error || 'Failed to load node');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!data?.node) return;

    const confirmMsg =
      data.node.type === 'person'
        ? 'Cannot delete person nodes'
        : `Delete "${data.node.name}"? This cannot be undone.`;

    if (data.node.type === 'person') {
      alert(confirmMsg);
      return;
    }

    if (!confirm(confirmMsg)) return;

    try {
      setDeleting(true);
      await onDelete();
      await onRefetch();
    } catch (err) {
      alert('Failed to delete node');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-sm text-[var(--color-text-secondary)]">Loading...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-2">
        <div className="text-sm text-red-500">{error || 'Node not found'}</div>
        <button onClick={fetchNodeData} className="btn-secondary text-sm">
          Retry
        </button>
      </div>
    );
  }

  const { node, incoming, outgoing } = data;

  // Type badge color
  const typeBadgeColor =
    node.type === 'person'
      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
      : node.type === 'url'
      ? 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300'
      : 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300';

  // Group edges by relation
  const groupEdges = (edges: Edge[]) => {
    const groups: Record<string, Edge[]> = {};
    edges.forEach((edge) => {
      if (!groups[edge.relation]) groups[edge.relation] = [];
      groups[edge.relation].push(edge);
    });
    return groups;
  };

  const incomingGroups = groupEdges(incoming);
  const outgoingGroups = groupEdges(outgoing);

  return (
    <div className="space-y-6">
      {/* Node Details */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <span className={`px-2 py-1 rounded text-xs font-medium ${typeBadgeColor}`}>
            {node.type.toUpperCase()}
          </span>
        </div>

        <h3 className="text-xl font-semibold mb-2">{node.name}</h3>

        {node.description && (
          <p className="text-sm text-[var(--color-text-secondary)] mb-3">{node.description}</p>
        )}

        <div className="space-y-1 text-sm">
          {node.email && (
            <div>
              <span className="text-[var(--color-text-secondary)]">Email:</span>{' '}
              <span className="font-mono">{node.email}</span>
            </div>
          )}
          {node.url && (
            <div>
              <span className="text-[var(--color-text-secondary)]">URL:</span>{' '}
              <a
                href={node.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--color-primary)] hover:underline font-mono break-all"
              >
                {node.url}
              </a>
            </div>
          )}
        </div>
      </section>

      {/* Edges */}
      <section>
        <h4 className="font-semibold mb-3">Connections</h4>

        {/* Incoming */}
        {Object.keys(incomingGroups).length > 0 && (
          <div className="mb-4">
            <h5 className="text-sm font-medium text-[var(--color-text-secondary)] mb-2">
              Incoming ({incoming.length})
            </h5>
            <div className="space-y-2">
              {Object.entries(incomingGroups).map(([relation, edges]) => (
                <div key={relation} className="text-sm">
                  <span className="font-medium capitalize">{relation.replace('_', ' ')}</span>
                  <span className="text-[var(--color-text-secondary)]"> from:</span>
                  <ul className="ml-4 mt-1 space-y-1">
                    {edges.map((edge) => (
                      <li key={edge.id} className="text-[var(--color-text)]">
                        • {/* We'd need to fetch node names, for now show IDs */}
                        <span className="font-mono text-xs opacity-70">{edge.from_node_id.slice(0, 8)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Outgoing */}
        {Object.keys(outgoingGroups).length > 0 && (
          <div>
            <h5 className="text-sm font-medium text-[var(--color-text-secondary)] mb-2">
              Outgoing ({outgoing.length})
            </h5>
            <div className="space-y-2">
              {Object.entries(outgoingGroups).map(([relation, edges]) => (
                <div key={relation} className="text-sm">
                  <span className="font-medium capitalize">{relation.replace('_', ' ')}</span>
                  <span className="text-[var(--color-text-secondary)]"> to:</span>
                  <ul className="ml-4 mt-1 space-y-1">
                    {edges.map((edge) => (
                      <li key={edge.id} className="text-[var(--color-text)]">
                        • {/* We'd need to fetch node names, for now show IDs */}
                        <span className="font-mono text-xs opacity-70">{edge.to_node_id.slice(0, 8)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {incoming.length === 0 && outgoing.length === 0 && (
          <p className="text-sm text-[var(--color-text-secondary)] italic">No connections yet</p>
        )}
      </section>

      {/* Actions */}
      <section className="space-y-2 pt-4 border-t border-gray-200 dark:border-gray-800">
        <button onClick={onConnect} className="btn-primary w-full">
          Connect to Another Node
        </button>
        <button onClick={onEdit} className="btn-secondary w-full">
          Edit Details
        </button>
        {node.type !== 'person' && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="btn-secondary w-full text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            {deleting ? 'Deleting...' : 'Delete Node'}
          </button>
        )}
      </section>
    </div>
  );
}
