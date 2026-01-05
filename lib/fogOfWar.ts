import type { Node, Edge } from '@/types';

export interface VisibilityInfo {
  hopDistance: number;
  opacity: number;
  visible: boolean;
}

export function calculateFogOfWar(
  nodes: Node[],
  edges: Edge[],
  centerNodeId: string | null
): Map<string, VisibilityInfo> {
  const visibility = new Map<string, VisibilityInfo>();

  console.log('[fogOfWar] Calculating visibility:', {
    centerNodeId,
    nodeCount: nodes.length,
    edgeCount: edges.length,
    edges: edges.map(e => `${e.from_node_id.slice(0,8)}→${e.to_node_id.slice(0,8)} (${e.relation})`),
  });

  if (!centerNodeId) {
    // No center node, hide everything
    nodes.forEach((node) => {
      visibility.set(node.id, { hopDistance: 999, opacity: 0, visible: false });
    });
    return visibility;
  }

  // Build adjacency list (undirected)
  const adjacency = new Map<string, Set<string>>();
  nodes.forEach((node) => {
    adjacency.set(node.id, new Set());
  });

  edges.forEach((edge) => {
    adjacency.get(edge.from_node_id)?.add(edge.to_node_id);
    adjacency.get(edge.to_node_id)?.add(edge.from_node_id);
  });

  // BFS from center node
  const queue: Array<{ nodeId: string; distance: number }> = [
    { nodeId: centerNodeId, distance: 0 },
  ];
  const visited = new Set<string>([centerNodeId]);

  while (queue.length > 0) {
    const { nodeId, distance } = queue.shift()!;

    // Calculate visibility based on hop distance
    let opacity: number;
    let visible: boolean;

    if (distance === 0) {
      opacity = 1.0;
      visible = true;
    } else if (distance === 1) {
      opacity = 1.0;
      visible = true;
    } else if (distance === 2) {
      opacity = 0.7;
      visible = true;
    } else if (distance === 3) {
      opacity = 0.4;
      visible = true;
    } else {
      opacity = 0;
      visible = false;
    }

    visibility.set(nodeId, {
      hopDistance: distance,
      opacity,
      visible,
    });

    // Only explore up to 3 hops
    if (distance < 3) {
      const neighbors = adjacency.get(nodeId) || new Set();
      neighbors.forEach((neighborId) => {
        if (!visited.has(neighborId)) {
          visited.add(neighborId);
          queue.push({ nodeId: neighborId, distance: distance + 1 });
        }
      });
    }
  }

  // Mark unvisited nodes as invisible
  nodes.forEach((node) => {
    if (!visibility.has(node.id)) {
      visibility.set(node.id, { hopDistance: 999, opacity: 0, visible: false });
    }
  });

  return visibility;
}
