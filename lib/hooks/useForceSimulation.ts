import { useEffect, useRef } from 'react';
import type { GraphNode, GraphEdge } from '@/types';

interface ForceSimulationConfig {
  springLength?: number;
  springStrength?: number;
  repulsion?: number;
  damping?: number;
  centerStrength?: number;
}

const DEFAULT_CONFIG: Required<ForceSimulationConfig> = {
  springLength: 3,
  springStrength: 0.01,
  repulsion: 50,
  damping: 0.85,
  centerStrength: 0.01,
};

export function useForceSimulation(
  nodes: GraphNode[],
  edges: GraphEdge[],
  config: ForceSimulationConfig = {},
  isPaused: boolean = false
) {
  const animationFrameRef = useRef<number>();
  const { springLength, springStrength, repulsion, damping, centerStrength } = {
    ...DEFAULT_CONFIG,
    ...config,
  };

  useEffect(() => {
    if (isPaused || nodes.length === 0) return;

    const simulate = () => {
      // Apply forces to each node
      nodes.forEach((node) => {
        let fx = 0;
        let fy = 0;
        let fz = 0;

        // Repulsion force (Coulomb's law)
        nodes.forEach((other) => {
          if (node.id === other.id) return;

          const dx = node.x - other.x;
          const dy = node.y - other.y;
          const dz = node.z - other.z;
          const distSq = dx * dx + dy * dy + dz * dz + 0.1; // Avoid division by zero
          const dist = Math.sqrt(distSq);

          const force = repulsion / distSq;

          fx += (dx / dist) * force;
          fy += (dy / dist) * force;
          fz += (dz / dist) * force;
        });

        // Spring force (Hooke's law) for connected nodes
        node.edges.forEach((edge) => {
          const other = edge.source.id === node.id ? edge.target : edge.source;

          const dx = other.x - node.x;
          const dy = other.y - node.y;
          const dz = other.z - node.z;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz + 0.1);

          const force = (dist - springLength) * springStrength;

          fx += (dx / dist) * force;
          fy += (dy / dist) * force;
          fz += (dz / dist) * force;
        });

        // Centering force
        fx -= node.x * centerStrength;
        fy -= node.y * centerStrength;
        fz -= node.z * centerStrength;

        // Update velocity
        node.vx = (node.vx + fx) * damping;
        node.vy = (node.vy + fy) * damping;
        node.vz = (node.vz + fz) * damping;

        // Update position
        node.x += node.vx;
        node.y += node.vy;
        node.z += node.vz;
      });

      animationFrameRef.current = requestAnimationFrame(simulate);
    };

    simulate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [nodes, edges, isPaused, springLength, springStrength, repulsion, damping, centerStrength]);
}
