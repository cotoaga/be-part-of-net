'use client';

import { useState } from 'react';

interface InvitePanelProps {
  centerNodeId: string;
  onSuccess: (newNodeId: string) => Promise<void>;
  onClose: () => void;
}

export default function InvitePanel({ centerNodeId, onSuccess, onClose }: InvitePanelProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    if (!centerNodeId) {
      setError('No node selected. Please select a node first.');
      return;
    }

    try {
      setSubmitting(true);

      // Step 1: Create person node
      const nodeResponse = await fetch('/api/nodes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'person',
          name: name.trim(),
          email: email.trim(),
          description: description.trim() || undefined,
          invited_by: centerNodeId,
        }),
      });

      const nodeResult = await nodeResponse.json();

      if (!nodeResponse.ok) {
        if (nodeResponse.status === 409 && nodeResult.existingNodeId) {
          setError(`Person with email "${email}" already exists`);
        } else {
          // Show detailed validation errors if available
          if (nodeResult.details && Array.isArray(nodeResult.details)) {
            const errorMsg = nodeResult.details.map((d: any) => `${d.field}: ${d.message}`).join(', ');
            setError(errorMsg || nodeResult.error || 'Failed to create person');
          } else {
            setError(nodeResult.error || 'Failed to create person');
          }
        }
        setSubmitting(false);
        return;
      }

      const newNodeId = nodeResult.node.id;

      // Step 2: Create invited edge
      console.log('[InvitePanel] Creating edge:', {
        from_node_id: centerNodeId,
        to_node_id: newNodeId,
        relation: 'invited',
      });

      const edgeResponse = await fetch('/api/edges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from_node_id: centerNodeId,
          to_node_id: newNodeId,
          relation: 'invited',
        }),
      });

      const edgeResult = await edgeResponse.json();
      console.log('[InvitePanel] Edge creation response:', {
        ok: edgeResponse.ok,
        status: edgeResponse.status,
        result: edgeResult,
      });

      if (!edgeResponse.ok) {
        // Edge creation failed, but node was created
        // We could try to delete the node here, but let's just show error
        console.error('[InvitePanel] Edge creation failed:', edgeResult);
        setError(edgeResult.error || 'Person created but failed to create invitation edge');
        setSubmitting(false);
        return;
      }

      // Success!
      console.log('[InvitePanel] Both node and edge created successfully!');
      await onSuccess(newNodeId);
      onClose();
    } catch (err) {
      setError('Network error');
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="text-sm text-[var(--color-text-secondary)]">
        Invite a new person to the network. They will be connected to the current centered node.
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
          placeholder="Enter person's name"
          required
          maxLength={100}
          autoFocus
        />
      </div>

      {/* Email */}
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
          placeholder="Optional description or bio"
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
          {submitting ? 'Inviting...' : 'Invite Person'}
        </button>
      </div>
    </form>
  );
}
