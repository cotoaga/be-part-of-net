'use client';

import type { Node } from '@/types';

interface JumpToButtonsProps {
  nodes: Node[];
  centerNodeId: string | null;
  onJumpTo: (nodeId: string) => void;
}

export default function JumpToButtons({ nodes, centerNodeId, onJumpTo }: JumpToButtonsProps) {
  // Filter to person nodes only
  const personNodes = nodes.filter((n) => n.type === 'person');

  if (personNodes.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 p-2 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 flex-wrap">
      <span className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wide">
        Jump to:
      </span>
      {personNodes.map((node) => (
        <button
          key={node.id}
          onClick={() => onJumpTo(node.id)}
          className={`text-xs px-2 py-1 rounded transition-colors ${
            centerNodeId === node.id
              ? 'bg-[var(--color-primary)] text-white'
              : 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-700'
          }`}
          title={`Jump to ${node.name}`}
        >
          {node.name}
        </button>
      ))}
    </div>
  );
}
