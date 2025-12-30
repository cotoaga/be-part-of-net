'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { Node, Edge, GraphNode, GraphEdge } from '@/types';
import Node3D from './Node3D';
import Edge3D from './Edge3D';
import { useForceSimulation } from '@/lib/hooks/useForceSimulation';
import { calculateFogOfWar } from '@/lib/fogOfWar';
import * as THREE from 'three';

interface GraphCanvasProps {
  nodes: Node[];
  edges: Edge[];
  centerNodeId: string | null;
  onNodeClick: (nodeId: string) => void;
  recenterTrigger?: number;
}

function CameraController({
  target,
  shouldAnimate
}: {
  target: [number, number, number];
  shouldAnimate: boolean;
}) {
  const { camera } = useThree();
  const [isAnimating, setIsAnimating] = useState(false);
  const targetPos = useRef(new THREE.Vector3(...target));
  const startPos = useRef(new THREE.Vector3());
  const progress = useRef(0);

  useEffect(() => {
    if (shouldAnimate) {
      // Start animation when target changes
      startPos.current.copy(camera.position);
      targetPos.current.set(
        target[0],
        target[1] + 15, // Higher up to see more of graph
        target[2] + 25  // Further back to see more nodes
      );
      progress.current = 0;
      setIsAnimating(true);
    }
  }, [target, shouldAnimate, camera]);

  useFrame(() => {
    if (isAnimating && progress.current < 1) {
      progress.current += 0.03;

      if (progress.current >= 1) {
        progress.current = 1;
        setIsAnimating(false);
      }

      // Smooth easing
      const eased = 1 - Math.pow(1 - progress.current, 3);
      camera.position.lerpVectors(startPos.current, targetPos.current, eased);
      camera.lookAt(target[0], target[1], target[2]);
    }
  });

  return null;
}

function Scene({ nodes, edges, centerNodeId, onNodeClick, recenterTrigger }: GraphCanvasProps) {
  const [isPaused, setIsPaused] = useState(false);
  const [shouldAnimateCamera, setShouldAnimateCamera] = useState(false);
  const prevCenterRef = useRef(centerNodeId);
  const prevRecenterRef = useRef(recenterTrigger);

  useEffect(() => {
    // Animate when center node changes OR recenter is triggered
    const centerChanged = centerNodeId !== prevCenterRef.current;
    const recenterTriggered = recenterTrigger !== prevRecenterRef.current;

    if (centerChanged || recenterTriggered) {
      setShouldAnimateCamera(true);
      prevCenterRef.current = centerNodeId;
      prevRecenterRef.current = recenterTrigger;
      // Reset animation flag after triggering
      setTimeout(() => setShouldAnimateCamera(false), 100);
    }
  }, [centerNodeId, recenterTrigger]);

  // Transform nodes and edges into graph format with positions
  const graphData = useMemo(() => {
    const graphNodes: GraphNode[] = nodes.map((node) => ({
      ...node,
      x: Math.random() * 20 - 10,
      y: Math.random() * 20 - 10,
      z: Math.random() * 20 - 10,
      vx: 0,
      vy: 0,
      vz: 0,
      edges: [],
    }));

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

  // Run force simulation
  useForceSimulation(graphData.nodes, graphData.edges, {}, isPaused);

  // Calculate fog of war
  const visibility = useMemo(() => {
    return calculateFogOfWar(nodes, edges, centerNodeId);
  }, [nodes, edges, centerNodeId]);

  // Find center node for camera
  const centerNode = graphData.nodes.find((n) => n.id === centerNodeId);
  const cameraTarget: [number, number, number] = centerNode
    ? [centerNode.x, centerNode.y, centerNode.z]
    : [0, 0, 0];

  // Find root node (invited_by is null)
  const rootNodeId = nodes.find((n) => n.invited_by === null)?.id;

  return (
    <>
      <CameraController target={cameraTarget} shouldAnimate={shouldAnimateCamera} />

      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />

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
          />
        );
      })}

      <OrbitControls
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
  return (
    <Canvas
      camera={{ position: [0, 5, 10], fov: 75 }}
      style={{ background: 'var(--color-background)' }}
    >
      <Scene {...props} />
    </Canvas>
  );
}
