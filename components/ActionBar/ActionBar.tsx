'use client';

import type { NodeType } from '@/types';

interface ActionBarProps {
  selectedNodeId: string | null;
  selectedNodeType?: NodeType;
  interactionMode: any; // Kept for DebugOverlay compatibility
  physicsPaused: boolean;
  debugVisible: boolean;
  disabled?: boolean;
  onInvite: () => void;
  onCreate: () => void;
  onUse: () => void;
  onConnect: () => void;
  onEdit: () => void;
  onTogglePause: () => void;
  onToggleDebug: () => void;
}

export default function ActionBar({
  selectedNodeId,
  selectedNodeType,
  physicsPaused,
  debugVisible,
  disabled = false,
  onInvite,
  onCreate,
  onUse,
  onConnect,
  onEdit,
  onTogglePause,
  onToggleDebug,
}: ActionBarProps) {
  const hasSelection = !!selectedNodeId;
  const isPersonNode = selectedNodeType === 'person';

  return (
    <div className="flex items-center gap-2 p-3 border-b border-gray-200 dark:border-gray-800 bg-[var(--color-surface)] flex-wrap">
      {/* Primary Actions */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={onInvite}
          disabled={disabled}
          className="btn-secondary text-sm"
          title={disabled ? 'Read-only mode' : 'Invite a new person to the network'}
        >
          <span className="max-md:hidden">Invite</span>
          <span className="md:hidden">👤</span>
        </button>

        <button
          onClick={onCreate}
          disabled={disabled}
          className="btn-secondary text-sm"
          title={disabled ? 'Read-only mode' : 'Create a new URL or MCP resource'}
        >
          <span className="max-md:hidden">Create</span>
          <span className="md:hidden">➕</span>
        </button>

        <button
          onClick={onUse}
          disabled={disabled}
          className="btn-secondary text-sm"
          title={disabled ? 'Read-only mode' : 'Search and collaborate on existing resources'}
        >
          <span className="max-md:hidden">Collaborate</span>
          <span className="md:hidden">🔍</span>
        </button>

        <button
          onClick={onConnect}
          disabled={disabled || !hasSelection || !isPersonNode}
          className="btn-secondary text-sm"
          title={
            disabled
              ? 'Read-only mode'
              : !hasSelection
              ? 'Select a person node first'
              : !isPersonNode
              ? 'Connect only works with person nodes'
              : 'Create a social connection with another person'
          }
        >
          <span className="max-md:hidden">Connect</span>
          <span className="md:hidden">🔗</span>
        </button>

        <button
          onClick={onEdit}
          disabled={disabled || !hasSelection}
          className="btn-secondary text-sm"
          title={
            disabled
              ? 'Read-only mode'
              : !hasSelection
              ? 'Select a node first'
              : 'Edit selected node'
          }
        >
          <span className="max-md:hidden">Edit</span>
          <span className="md:hidden">✏️</span>
        </button>
      </div>

      {/* Spacer */}
      <div className="flex-1 min-w-[20px]" />

      {/* Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={onTogglePause}
          className="btn-secondary text-sm"
          title={physicsPaused ? 'Resume physics simulation' : 'Pause physics simulation'}
        >
          <span className="mr-1">{physicsPaused ? '▶️' : '⏸️'}</span>
          <span className="max-md:hidden">{physicsPaused ? 'Resume' : 'Pause'}</span>
        </button>

        <button
          onClick={onToggleDebug}
          className={`btn-secondary text-sm ${debugVisible ? 'opacity-100' : 'opacity-50'}`}
          title={debugVisible ? 'Hide debug overlay' : 'Show debug overlay'}
        >
          <span className="max-md:hidden">Debug</span>
          <span className="md:hidden">🐛</span>
        </button>
      </div>
    </div>
  );
}
