'use client';

import { InteractionMode } from '@/types';

interface DebugOverlayProps {
  visible: boolean;
  cameraState: string;
  isDragging: boolean;
  orbitControlsEnabled: boolean;
  forceSimulationPaused: boolean;
  nodeCount: number;
  edgeCount: number;
  centerNodeId: string | null;
  centerNodeName?: string | null;
  interactionMode: InteractionMode;
  selectedNodeName?: string | null;
}

export default function DebugOverlay({
  visible,
  cameraState,
  isDragging,
  orbitControlsEnabled,
  forceSimulationPaused,
  nodeCount,
  edgeCount,
  centerNodeId,
  centerNodeName,
  interactionMode,
  selectedNodeName,
}: DebugOverlayProps) {
  if (!visible) return null;

  // Determine current mode
  let mode = 'UNKNOWN';
  let modeColor = 'bg-gray-500';

  if (interactionMode === InteractionMode.CONNECT_SELECT) {
    mode = 'CONNECT: SELECT SOURCE';
    modeColor = 'bg-cyan-500';
  } else if (interactionMode === InteractionMode.CONNECT_TARGET) {
    mode = 'CONNECT: SELECT TARGET';
    modeColor = 'bg-cyan-500';
  } else if (cameraState === 'animating') {
    mode = 'ANIMATING';
    modeColor = 'bg-yellow-500';
  } else if (isDragging) {
    mode = 'DRAG NODE';
    modeColor = 'bg-purple-500';
  } else if (orbitControlsEnabled) {
    mode = 'SPIN/ZOOM';
    modeColor = 'bg-green-500';
  } else if (cameraState === 'initializing') {
    mode = 'INITIALIZING';
    modeColor = 'bg-blue-500';
  }

  return (
    <div className="absolute top-4 right-4 bg-black/80 text-white p-4 rounded-lg font-mono text-xs space-y-2 pointer-events-none z-50">
      {/* Mode Indicator */}
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${modeColor} animate-pulse`} />
        <span className="font-bold text-sm">{mode} MODE</span>
      </div>

      <div className="border-t border-white/20 pt-2 space-y-1">
        {/* Camera State */}
        <div className="flex justify-between gap-4">
          <span className="text-gray-400">Camera State:</span>
          <span className="font-semibold">{cameraState.toUpperCase()}</span>
        </div>

        {/* OrbitControls */}
        <div className="flex justify-between gap-4">
          <span className="text-gray-400">OrbitControls:</span>
          <span className={orbitControlsEnabled ? 'text-green-400' : 'text-red-400'}>
            {orbitControlsEnabled ? 'ENABLED' : 'DISABLED'}
          </span>
        </div>

        {/* Dragging State */}
        <div className="flex justify-between gap-4">
          <span className="text-gray-400">Node Drag:</span>
          <span className={isDragging ? 'text-purple-400' : 'text-gray-500'}>
            {isDragging ? 'ACTIVE' : 'INACTIVE'}
          </span>
        </div>

        {/* Force Simulation */}
        <div className="flex justify-between gap-4">
          <span className="text-gray-400">Physics:</span>
          <span className={forceSimulationPaused ? 'text-red-400' : 'text-green-400'}>
            {forceSimulationPaused ? 'PAUSED' : 'RUNNING'}
          </span>
        </div>
      </div>

      <div className="border-t border-white/20 pt-2 space-y-1">
        {/* Graph Stats */}
        <div className="flex justify-between gap-4">
          <span className="text-gray-400">Nodes:</span>
          <span>{nodeCount}</span>
        </div>

        <div className="flex justify-between gap-4">
          <span className="text-gray-400">Edges:</span>
          <span>{edgeCount}</span>
        </div>

        <div className="flex justify-between gap-4">
          <span className="text-gray-400">Centered:</span>
          <span className="text-xs font-semibold">
            {centerNodeName || (centerNodeId ? `ID: ${centerNodeId.slice(0, 8)}...` : 'None')}
          </span>
        </div>

        {selectedNodeName && (
          <div className="flex justify-between gap-4">
            <span className="text-gray-400">Selected:</span>
            <span className="text-xs font-semibold text-cyan-400">{selectedNodeName}</span>
          </div>
        )}
      </div>

      <div className="border-t border-white/20 pt-2 text-gray-400 text-[10px]">
        <div>SPIN/ZOOM: Drag/scroll to move camera</div>
        <div>DRAG NODE: Click+drag node to reposition</div>
        <div>SELECT: Click node to center view</div>
        {interactionMode !== InteractionMode.IDLE && (
          <div className="text-cyan-400">CONNECT: Click nodes to link them</div>
        )}
      </div>
    </div>
  );
}
