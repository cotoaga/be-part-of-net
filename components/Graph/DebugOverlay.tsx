'use client';

interface DebugOverlayProps {
  cameraState: string;
  isDragging: boolean;
  orbitControlsEnabled: boolean;
  forceSimulationPaused: boolean;
  nodeCount: number;
  edgeCount: number;
  centerNodeId: string | null;
}

export default function DebugOverlay({
  cameraState,
  isDragging,
  orbitControlsEnabled,
  forceSimulationPaused,
  nodeCount,
  edgeCount,
  centerNodeId,
}: DebugOverlayProps) {
  // Determine current mode
  let mode = 'UNKNOWN';
  let modeColor = 'bg-gray-500';

  if (cameraState === 'animating') {
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
          <span className="text-gray-400">Center:</span>
          <span className="text-xs">{centerNodeId ? centerNodeId.slice(0, 8) : 'None'}</span>
        </div>
      </div>

      <div className="border-t border-white/20 pt-2 text-gray-400 text-[10px]">
        <div>SPIN/ZOOM: Drag/scroll to move camera</div>
        <div>DRAG NODE: Click+drag node to reposition</div>
        <div>SELECT: Click node to center view</div>
      </div>
    </div>
  );
}
