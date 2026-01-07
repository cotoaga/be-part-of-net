'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { Node, Edge, GraphNode, GraphEdge } from '@/types';
import { InteractionMode } from '@/types';
import Node3D from './Node3D';
import Edge3D from './Edge3D';
import { useForceSimulation } from '@/lib/hooks/useForceSimulation';
import { calculateFogOfWar, type VisibilityInfo } from '@/lib/fogOfWar';
import { computeStableLayout } from '@/lib/graphLayout';
import DebugOverlay from './DebugOverlay';
import NodeNameplates from './NodeNameplates';
import * as THREE from 'three';

interface GraphCanvasProps {
  nodes: Node[];
  edges: Edge[];
  centerNodeId: string | null;
  onNodeClick: (nodeId: string) => void;
  recenterTrigger?: number;
  // Phase 2: Connect mode props
  interactionMode: InteractionMode;
  connectSourceId: string | null;
  onConnectSelect: (nodeId: string) => void;
  onConnectTarget: (nodeId: string) => void;
  // Phase 2: Physics control
  physicsPaused: boolean;
  // Phase 2: Debug visibility
  debugVisible: boolean;
  onDebugUpdate?: (info: {
    cameraState: string;
    isDragging: boolean;
    orbitControlsEnabled: boolean;
    forceSimulationPaused: boolean;
    nodeCount: number;
    edgeCount: number;
  }) => void;
}

enum CameraState {
  INITIALIZING = 'initializing',
  ANIMATING = 'animating',
  USER_CONTROL = 'user_control'
}

function CameraFovController({ fov }: { fov: number }) {
  const { camera } = useThree();

  useEffect(() => {
    if ('fov' in camera) {
      (camera as THREE.PerspectiveCamera).fov = fov;
      camera.updateProjectionMatrix();
    }
  }, [camera, fov]);

  return null;
}

function CameraController({
  target,
  cameraState,
  recenterTrigger,
  onInitialized,
  onAnimationStart,
  onAnimationEnd
}: {
  target: [number, number, number];
  cameraState: CameraState;
  recenterTrigger?: number;
  onInitialized: () => void;
  onAnimationStart: () => void;
  onAnimationEnd: () => void;
}) {
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3(...target));
  const startPos = useRef(new THREE.Vector3());
  const progress = useRef(0);
  const hasInitialized = useRef(false);
  const prevTargetRef = useRef(target);
  const prevRecenterRef = useRef(recenterTrigger);

  // Extract individual target values for stable dependencies
  const [targetX, targetY, targetZ] = target;

  // Initialize camera on first mount
  // No delay needed since positions are pre-computed and stable
  useEffect(() => {
    if (!hasInitialized.current) {
      camera.position.set(
        targetX,
        targetY + 15,
        targetZ + 25
      );
      camera.lookAt(targetX, targetY, targetZ);
      hasInitialized.current = true;
      onInitialized();
    }
  }, [targetX, targetY, targetZ, camera, onInitialized]);

  // Trigger animation when target changes OR recenter is clicked
  useEffect(() => {
    if (hasInitialized.current && cameraState === CameraState.USER_CONTROL) {
      const targetChanged =
        targetX !== prevTargetRef.current[0] ||
        targetY !== prevTargetRef.current[1] ||
        targetZ !== prevTargetRef.current[2];

      const recenterTriggered = recenterTrigger !== prevRecenterRef.current;

      if (targetChanged || recenterTriggered) {
        console.log('[CameraController] Starting animation:', targetChanged ? 'target change' : 'recenter');
        startPos.current.copy(camera.position);
        targetPos.current.set(
          targetX,
          targetY + 15,
          targetZ + 25
        );
        progress.current = 0;
        prevTargetRef.current = [targetX, targetY, targetZ];
        prevRecenterRef.current = recenterTrigger;
        onAnimationStart();
      }
    }
  }, [targetX, targetY, targetZ, cameraState, recenterTrigger, camera, onAnimationStart]);

  // Animate camera
  useFrame(() => {
    if (cameraState === CameraState.ANIMATING && progress.current < 1) {
      progress.current += 0.015;

      if (progress.current >= 1) {
        progress.current = 1;
        onAnimationEnd();
      }

      const eased = progress.current < 0.5
        ? 2 * progress.current * progress.current
        : 1 - Math.pow(-2 * progress.current + 2, 2) / 2;

      camera.position.lerpVectors(startPos.current, targetPos.current, eased);
      camera.lookAt(targetX, targetY, targetZ);
    }
  });

  return null;
}

function Scene({
  nodes,
  edges,
  centerNodeId,
  onNodeClick,
  recenterTrigger,
  interactionMode,
  connectSourceId,
  onConnectSelect,
  onConnectTarget,
  physicsPaused,
  onDebugUpdate,
  nodeSizeMultiplier = 2.0,
  labelSizeMultiplier = 2.0,
  springStrength = 0.01,
  cameraFov = 75,
  show3DLabels = true,
  onSceneReady
}: GraphCanvasProps & {
  nodeSizeMultiplier?: number;
  labelSizeMultiplier?: number;
  springStrength?: number;
  cameraFov?: number;
  show3DLabels?: boolean;
  onSceneReady?: (data: {
    camera: THREE.Camera;
    size: { width: number; height: number };
    nodes: GraphNode[];
    visibility: Map<string, VisibilityInfo>;
    rootNodeId: string | null;
  }) => void;
}) {
  const [isPaused, setIsPaused] = useState(false);
  const [cameraState, setCameraState] = useState<CameraState>(CameraState.INITIALIZING);
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const prevCenterRef = useRef(centerNodeId);
  const prevRecenterRef = useRef(recenterTrigger);
  const orbitControlsRef = useRef<any>(null);
  const { camera, gl, size } = useThree();

  // Store GraphNode objects persistently across renders to prevent displacement
  // The force simulation mutates these objects, so we need to reuse them
  const graphNodesRef = useRef<Map<string, GraphNode>>(new Map());

  // Update debug info whenever state changes
  useEffect(() => {
    if (onDebugUpdate) {
      onDebugUpdate({
        cameraState,
        isDragging: !!draggedNodeId,
        orbitControlsEnabled: cameraState === CameraState.USER_CONTROL && !draggedNodeId,
        forceSimulationPaused: isPaused || !!draggedNodeId,
        nodeCount: nodes.length,
        edgeCount: edges.length,
      });
    }
  }, [cameraState, draggedNodeId, isPaused, nodes.length, edges.length, onDebugUpdate]);

  // Camera state callbacks
  const handleCameraInitialized = () => {
    console.log('[Camera] Initialized, enabling user control');
    setCameraState(CameraState.USER_CONTROL);
  };

  const handleAnimationStart = () => {
    console.log('[Camera] Animation started, disabling user control');
    setCameraState(CameraState.ANIMATING);
  };

  const handleAnimationEnd = () => {
    console.log('[Camera] Animation ended, enabling user control');
    setCameraState(CameraState.USER_CONTROL);
  };

  // Track center node changes (CameraController will handle animation)
  useEffect(() => {
    prevCenterRef.current = centerNodeId;
  }, [centerNodeId]);

  // Track recenter trigger (CameraController will handle animation)
  useEffect(() => {
    prevRecenterRef.current = recenterTrigger;
  }, [recenterTrigger]);

  // Transform nodes and edges into graph format with positions
  const graphData = useMemo(() => {
    // Pre-compute stable positions on first initialization
    const stablePositions = graphNodesRef.current.size === 0
      ? computeStableLayout(nodes, edges)
      : null;

    const graphNodes: GraphNode[] = nodes.map((node) => {
      // Try to get existing GraphNode, or create new one
      let graphNode = graphNodesRef.current.get(node.id);
      if (!graphNode) {
        // Use pre-computed stable position if available, otherwise use smaller random range
        const pos = stablePositions?.get(node.id) || {
          x: Math.random() * 5,
          y: Math.random() * 5,
          z: Math.random() * 5,
        };

        graphNode = {
          ...node,
          ...pos,
          vx: 0,
          vy: 0,
          vz: 0,
          edges: [],
        };
        graphNodesRef.current.set(node.id, graphNode);
      } else {
        // Update node data but preserve position/velocity
        Object.assign(graphNode, {
          ...node,
          x: graphNode.x,
          y: graphNode.y,
          z: graphNode.z,
          vx: graphNode.vx,
          vy: graphNode.vy,
          vz: graphNode.vz,
          edges: [], // Will be repopulated below
        });
      }

      return graphNode;
    });

    // Clean up removed nodes from ref
    const nodeIds = new Set(nodes.map(n => n.id));
    for (const id of Array.from(graphNodesRef.current.keys())) {
      if (!nodeIds.has(id)) {
        graphNodesRef.current.delete(id);
      }
    }

    const nodeMap = new Map(graphNodes.map((n) => [n.id, n]));

    const graphEdges: GraphEdge[] = edges
      .map((edge) => {
        const source = nodeMap.get(edge.from_node_id);
        const target = nodeMap.get(edge.to_node_id);
        if (!source || !target) return null;

        const graphEdge: GraphEdge = {
          ...edge,
          source,
          target,
        };

        source.edges.push(graphEdge);
        target.edges.push(graphEdge);

        return graphEdge;
      })
      .filter(Boolean) as GraphEdge[];

    return { nodes: graphNodes, edges: graphEdges };
  }, [nodes, edges]);

  // Run force simulation (pause when dragging or user manually paused or in connect mode)
  const isInConnectMode = interactionMode !== InteractionMode.IDLE;
  useForceSimulation(
    graphData.nodes,
    graphData.edges,
    { springStrength },
    isPaused || !!draggedNodeId || physicsPaused || isInConnectMode
  );

  // Calculate fog of war
  const visibility = useMemo(() => {
    return calculateFogOfWar(nodes, edges, centerNodeId);
  }, [nodes, edges, centerNodeId]);

  // Find center node for camera - memoized to prevent unnecessary OrbitControls updates
  const cameraTarget: [number, number, number] = useMemo(() => {
    const centerNode = graphData.nodes.find((n) => n.id === centerNodeId);
    return centerNode
      ? [centerNode.x, centerNode.y, centerNode.z]
      : [0, 0, 0];
  }, [graphData.nodes, centerNodeId]);

  // Find root node (invited_by is null)
  const rootNodeId = nodes.find((n) => n.invited_by === null)?.id;

  // Update scene data for nameplate rendering
  useEffect(() => {
    if (onSceneReady) {
      onSceneReady({
        camera,
        size,
        nodes: graphData.nodes,
        visibility,
        rootNodeId: rootNodeId || null,
      });
    }
  }, [camera, size, graphData.nodes, visibility, rootNodeId, onSceneReady]);

  // Handle node dragging
  const handleNodeDragStart = (nodeId: string) => {
    setDraggedNodeId(nodeId);
    // OrbitControls will be disabled automatically by enabled prop based on cameraState
  };

  const handleNodeDrag = (nodeId: string, position: [number, number, number]) => {
    const node = graphData.nodes.find((n) => n.id === nodeId);
    if (node) {
      node.x = position[0];
      node.y = position[1];
      node.z = position[2];
      // Reset velocity to prevent physics from immediately moving it
      node.vx = 0;
      node.vy = 0;
      node.vz = 0;
    }
  };

  const handleNodeDragEnd = () => {
    setDraggedNodeId(null);
    // OrbitControls will be re-enabled automatically by enabled prop based on cameraState
  };

  // Sync OrbitControls target when transitioning to USER_CONTROL
  // This ensures OrbitControls has correct target after animation completes
  useEffect(() => {
    if (orbitControlsRef.current && cameraState === CameraState.USER_CONTROL) {
      console.log('[OrbitControls] Syncing target to', cameraTarget);
      orbitControlsRef.current.target.set(cameraTarget[0], cameraTarget[1], cameraTarget[2]);
      orbitControlsRef.current.update();
    }
  }, [cameraState, cameraTarget]);

  return (
    <>
      <CameraFovController fov={cameraFov} />
      <CameraController
        target={cameraTarget}
        cameraState={cameraState}
        recenterTrigger={recenterTrigger}
        onInitialized={handleCameraInitialized}
        onAnimationStart={handleAnimationStart}
        onAnimationEnd={handleAnimationEnd}
      />

      {/* Enhanced lighting for beautiful sphere rendering */}
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} castShadow />
      <pointLight position={[-10, -10, -5]} intensity={0.4} color="#4080ff" />
      <pointLight position={[0, 20, 0]} intensity={0.3} color="#ffffff" />
      <hemisphereLight args={['#ffffff', '#444444', 0.6]} />

      {/* Render edges */}
      {graphData.edges.map((edge) => {
        const sourceVis = visibility.get(edge.from_node_id);
        const targetVis = visibility.get(edge.to_node_id);
        const opacity = Math.min(sourceVis?.opacity || 0, targetVis?.opacity || 0);

        if (opacity === 0) return null;

        return <Edge3D key={edge.id} edge={edge} opacity={opacity} />;
      })}

      {/* Render nodes */}
      {graphData.nodes.map((node) => {
        const vis = visibility.get(node.id);
        if (!vis || vis.opacity === 0) return null;

        return (
          <Node3D
            key={node.id}
            node={node}
            opacity={vis.opacity}
            isCenter={node.id === centerNodeId}
            isRoot={node.id === rootNodeId}
            onClick={() => onNodeClick(node.id)}
            onDragStart={handleNodeDragStart}
            onDrag={handleNodeDrag}
            onDragEnd={handleNodeDragEnd}
            isDragged={draggedNodeId === node.id}
            // Phase 2: Connect mode props
            interactionMode={interactionMode}
            connectSourceId={connectSourceId}
            onConnectSelect={onConnectSelect}
            onConnectTarget={onConnectTarget}
            // Size multipliers
            nodeSizeMultiplier={nodeSizeMultiplier}
            labelSizeMultiplier={labelSizeMultiplier}
            // Label visibility
            show3DLabels={show3DLabels}
          />
        );
      })}

      <OrbitControls
        ref={orbitControlsRef}
        enabled={cameraState === CameraState.USER_CONTROL && !draggedNodeId && !isInConnectMode}
        enableDamping
        dampingFactor={0.05}
        rotateSpeed={0.5}
        zoomSpeed={0.5}
        enablePan
        minDistance={5}
        maxDistance={100}
      />
    </>
  );
}

export default function GraphCanvas(props: GraphCanvasProps) {
  const [debugInfo, setDebugInfo] = useState({
    cameraState: 'initializing',
    isDragging: false,
    orbitControlsEnabled: false,
    forceSimulationPaused: false,
    nodeCount: 0,
    edgeCount: 0,
  });

  const [nodeSizeMultiplier, setNodeSizeMultiplier] = useState(2.0);
  const [labelSizeMultiplier, setLabelSizeMultiplier] = useState(2.0);
  const [springStrength, setSpringStrength] = useState(0.01);
  const [cameraFov, setCameraFov] = useState(75);

  // Label display toggles
  const [showNameplates, setShowNameplates] = useState(false);
  const [show3DLabels, setShow3DLabels] = useState(true);

  // Scene data for nameplate rendering
  const [sceneData, setSceneData] = useState<{
    camera: THREE.Camera;
    size: { width: number; height: number };
    nodes: GraphNode[];
    visibility: Map<string, VisibilityInfo>;
    rootNodeId: string | null;
  } | null>(null);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <Canvas
        camera={{ position: [0, 5, 10], fov: 75 }}
        style={{ background: 'var(--color-background)' }}
      >
        <Scene
          {...props}
          onDebugUpdate={setDebugInfo}
          nodeSizeMultiplier={nodeSizeMultiplier}
          labelSizeMultiplier={labelSizeMultiplier}
          springStrength={springStrength}
          cameraFov={cameraFov}
          show3DLabels={show3DLabels}
          onSceneReady={setSceneData}
        />
      </Canvas>

      {sceneData && (
        <NodeNameplates
          nodes={sceneData.nodes}
          visibility={sceneData.visibility}
          centerNodeId={props.centerNodeId}
          rootNodeId={sceneData.rootNodeId}
          onNodeClick={props.onNodeClick}
          camera={sceneData.camera}
          size={sceneData.size}
          enabled={showNameplates}
        />
      )}

      <DebugOverlay
        visible={props.debugVisible}
        cameraState={debugInfo.cameraState}
        isDragging={debugInfo.isDragging}
        orbitControlsEnabled={debugInfo.orbitControlsEnabled}
        forceSimulationPaused={debugInfo.forceSimulationPaused}
        nodeCount={debugInfo.nodeCount}
        edgeCount={debugInfo.edgeCount}
        centerNodeId={props.centerNodeId}
        centerNodeName={props.nodes.find(n => n.id === props.centerNodeId)?.name}
        interactionMode={props.interactionMode}
        selectedNodeName={undefined}
        nodeSizeMultiplier={nodeSizeMultiplier}
        labelSizeMultiplier={labelSizeMultiplier}
        springStrength={springStrength}
        cameraFov={cameraFov}
        onNodeSizeChange={setNodeSizeMultiplier}
        onLabelSizeChange={setLabelSizeMultiplier}
        onSpringStrengthChange={setSpringStrength}
        onCameraFovChange={setCameraFov}
        showNameplates={showNameplates}
        show3DLabels={show3DLabels}
        onNameplateToggle={() => setShowNameplates(!showNameplates)}
        on3DLabelToggle={() => setShow3DLabels(!show3DLabels)}
      />
    </div>
  );
}
