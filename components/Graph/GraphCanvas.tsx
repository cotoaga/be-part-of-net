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
}

function CameraController({ target }: { target: [number, number, number] }) {
  const { camera } = useThree();
  const targetRef = useRef(new THREE.Vector3(...target));

  useEffect(() => {
    targetRef.current.set(...target);
  }, [target]);

  useFrame(() => {
    // Smooth camera transition
    camera.position.lerp(
      new THREE.Vector3(
        targetRef.current.x,
        targetRef.current.y + 5,
        targetRef.current.z + 10
      ),
      0.05
    );
    camera.lookAt(targetRef.current);
    camera.updateProjectionMatrix();
  });

  return null;
}

function Scene({ nodes, edges, centerNodeId, onNodeClick }: GraphCanvasProps) {
  const [isPaused, setIsPaused] = useState(false);

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
      <CameraController target={cameraTarget} />

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
        target={cameraTarget}
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
