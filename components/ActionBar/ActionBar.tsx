'use client';

import { InteractionMode } from '@/types';

interface ActionBarProps {
  selectedNodeId: string | null;
  interactionMode: InteractionMode;
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
  interactionMode,
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
  const isInConnectMode = interactionMode !== InteractionMode.IDLE;
  const hasSelection = !!selectedNodeId;

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
          title={disabled ? 'Read-only mode' : 'Search and use existing resources'}
        >
          <span className="max-md:hidden">Use</span>
          <span className="md:hidden">🔍</span>
        </button>

        <button
          onClick={onConnect}
          disabled={disabled || !hasSelection}
          className={`btn-secondary text-sm ${
            isInConnectMode
              ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
              : ''
          }`}
          title={
            disabled
              ? 'Read-only mode'
              : !hasSelection
              ? 'Select a node first'
              : isInConnectMode
              ? 'Connect mode active - click nodes to connect'
              : 'Connect selected node to another'
          }
        >
          <span className="max-md:hidden">
            {isInConnectMode ? 'Connecting...' : 'Connect'}
          </span>
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
