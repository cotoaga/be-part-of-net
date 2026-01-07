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
  nodeSizeMultiplier: number;
  labelSizeMultiplier: number;
  springStrength: number;
  cameraFov: number;
  onNodeSizeChange: (value: number) => void;
  onLabelSizeChange: (value: number) => void;
  onSpringStrengthChange: (value: number) => void;
  onCameraFovChange: (value: number) => void;
  // Label display toggles
  showNameplates: boolean;
  show3DLabels: boolean;
  onNameplateToggle: () => void;
  on3DLabelToggle: () => void;
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
  nodeSizeMultiplier,
  labelSizeMultiplier,
  springStrength,
  cameraFov,
  onNodeSizeChange,
  onLabelSizeChange,
  onSpringStrengthChange,
  onCameraFovChange,
  showNameplates,
  show3DLabels,
  onNameplateToggle,
  on3DLabelToggle,
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

      {/* Size Controls */}
      <div className="border-t border-white/20 pt-2 space-y-3 pointer-events-auto">
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-xs">Node Size</span>
            <span className="text-xs font-semibold">{nodeSizeMultiplier.toFixed(1)}x</span>
          </div>
          <input
            type="range"
            min="1.0"
            max="4.0"
            step="0.1"
            value={nodeSizeMultiplier}
            onChange={(e) => onNodeSizeChange(parseFloat(e.target.value))}
            className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-xs">Label Size</span>
            <span className="text-xs font-semibold">{labelSizeMultiplier.toFixed(1)}x</span>
          </div>
          <input
            type="range"
            min="1.0"
            max="4.0"
            step="0.1"
            value={labelSizeMultiplier}
            onChange={(e) => onLabelSizeChange(parseFloat(e.target.value))}
            className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-xs">Spring Force</span>
            <span className="text-xs font-semibold">{springStrength.toFixed(3)}</span>
          </div>
          <input
            type="range"
            min="0.001"
            max="0.1"
            step="0.001"
            value={springStrength}
            onChange={(e) => onSpringStrengthChange(parseFloat(e.target.value))}
            className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-xs">Camera FOV</span>
            <span className="text-xs font-semibold">{cameraFov}°</span>
          </div>
          <input
            type="range"
            min="30"
            max="120"
            step="5"
            value={cameraFov}
            onChange={(e) => onCameraFovChange(parseFloat(e.target.value))}
            className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>
      </div>

      {/* Label Display Toggles */}
      <div className="border-t border-white/20 pt-3 mt-3 space-y-2 pointer-events-auto">
        <div className="text-gray-400 text-xs mb-2 font-semibold">LABEL DISPLAY</div>

        <button
          onClick={onNameplateToggle}
          className="w-full px-3 py-2 rounded bg-gray-800 hover:bg-gray-700
                     transition-colors text-left flex items-center justify-between"
        >
          <span className="text-xs font-medium">2D Nameplates</span>
          <div
            className={`w-10 h-5 rounded-full transition-colors ${
              showNameplates ? 'bg-green-500' : 'bg-gray-600'
            }`}
          >
            <div
              className={`w-4 h-4 bg-white rounded-full transition-transform transform ${
                showNameplates ? 'translate-x-6 mt-0.5' : 'translate-x-1 mt-0.5'
              }`}
            />
          </div>
        </button>

        <button
          onClick={on3DLabelToggle}
          className="w-full px-3 py-2 rounded bg-gray-800 hover:bg-gray-700
                     transition-colors text-left flex items-center justify-between"
        >
          <span className="text-xs font-medium">3D Labels</span>
          <div
            className={`w-10 h-5 rounded-full transition-colors ${
              show3DLabels ? 'bg-green-500' : 'bg-gray-600'
            }`}
          >
            <div
              className={`w-4 h-4 bg-white rounded-full transition-transform transform ${
                show3DLabels ? 'translate-x-6 mt-0.5' : 'translate-x-1 mt-0.5'
              }`}
            />
          </div>
        </button>
      </div>
    </div>
  );
}
