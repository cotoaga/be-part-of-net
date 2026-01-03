import type { Node, Edge } from '@/types';

interface TempGraphNode extends Node {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  edges: TempGraphEdge[];
}

interface TempGraphEdge extends Edge {
  source: TempGraphNode;
  target: TempGraphNode;
}

/**
 * Pre-compute stable node positions by running force simulation synchronously
 * This eliminates initial displacement by providing stable starting positions
 */
export function computeStableLayout(
  nodes: Node[],
  edges: Edge[],
  iterations: number = 300
): Map<string, { x: number; y: number; z: number }> {
  // Create temporary GraphNode objects with random initial positions
  const graphNodes: TempGraphNode[] = nodes.map((node) => ({
    ...node,
    x: Math.random() * 20 - 10,
    y: Math.random() * 20 - 10,
    z: Math.random() * 20 - 10,
    vx: 0,
    vy: 0,
    vz: 0,
    edges: [],
  }));

  // Build node map for edge creation
  const nodeMap = new Map(graphNodes.map((n) => [n.id, n]));

  // Create edges with source/target references
  const graphEdges: TempGraphEdge[] = edges
    .map((edge) => {
      const source = nodeMap.get(edge.from_node_id);
      const target = nodeMap.get(edge.to_node_id);
      if (!source || !target) return null;

      return {
        ...edge,
        source,
        target,
      };
    })
    .filter(Boolean) as TempGraphEdge[];

  // Populate bidirectional edge arrays on nodes
  graphEdges.forEach((edge) => {
    edge.source.edges.push(edge);
    edge.target.edges.push(edge);
  });

  // Force simulation parameters (matching useForceSimulation.ts)
  const springLength = 3;
  const springStrength = 0.01;
  const repulsion = 50;
  const damping = 0.85;
  const centerStrength = 0.01;

  // Run force simulation for N iterations
  for (let iter = 0; iter < iterations; iter++) {
    graphNodes.forEach((node) => {
      let fx = 0;
      let fy = 0;
      let fz = 0;

      // Repulsion force (Coulomb's law) - all nodes push each other away
      graphNodes.forEach((other) => {
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

      // Spring force (Hooke's law) - connected nodes pull together
      node.edges.forEach((edge) => {
        const other = edge.source.id === node.id ? edge.target : edge.source;

        const dx = other.x - node.x;
        const dy = other.y - node.y;
        const dz = other.z - node.z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz + 0.1);

        const force = (dist - springLength) * springStrength;

        fx += (dx / dist) * force;
        fy += (dx / dist) * force;
        fz += (dz / dist) * force;
      });

      // Centering force - gentle pull toward origin to prevent drift
      fx -= node.x * centerStrength;
      fy -= node.y * centerStrength;
      fz -= node.z * centerStrength;

      // Update velocity with damping
      node.vx = (node.vx + fx) * damping;
      node.vy = (node.vy + fy) * damping;
      node.vz = (node.vz + fz) * damping;

      // Update position
      node.x += node.vx;
      node.y += node.vy;
      node.z += node.vz;
    });
  }

  // Return position map
  const positions = new Map<string, { x: number; y: number; z: number }>();
  graphNodes.forEach((node) => {
    positions.set(node.id, { x: node.x, y: node.y, z: node.z });
  });

  return positions;
}
