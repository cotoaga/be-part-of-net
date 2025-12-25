/**
 * Fog-of-War Mechanics for Graph Visualization
 *
 * Visibility based on hop distance from centered node:
 * - Centered node (0): Full opacity, Saturn ring, detail card
 * - Hop 1: Full opacity, name labels visible
 * - Hop 2-3: Reduced opacity, name labels visible
 * - Hop 4: Very opaque, no labels (ghost nodes)
 * - Hop 5-6: Invisible (not rendered)
 *
 * Global Service Exemption:
 * - Nodes with is_global_service=true are ALWAYS visible
 * - Full opacity, labels shown, clickable regardless of hop distance
 * - Used for shared MCP services like Hondius that all users can access
 */

export interface HopDistanceMap {
  [nodeId: string]: number;
}

export interface NodeVisibility {
  opacity: number;
  showLabel: boolean;
  isClickable: boolean;
  isVisible: boolean;
  isCentered: boolean;
  renderLayer: 'front' | 'middle' | 'back' | 'hidden';
}

/**
 * Opacity values by hop distance
 */
export const FOG_OPACITY = {
  CENTERED: 1.0,
  HOP_1: 1.0,
  HOP_2: 0.75,
  HOP_3: 0.5,
  HOP_4: 0.15, // Very opaque, ghostly
  HOP_5_PLUS: 0.0, // Invisible
} as const;

/**
 * Edge opacity (slightly lower than node opacity)
 */
export const EDGE_OPACITY_MULTIPLIER = 0.7;

/**
 * Calculate visibility settings for a node based on hop distance
 */
export function getNodeVisibility(
  nodeId: string,
  centeredNodeId: string | null,
  hopDistances: HopDistanceMap,
  isGlobalService?: boolean
): NodeVisibility {
  // Global service nodes are always fully visible (exempt from fog-of-war)
  if (isGlobalService) {
    return {
      opacity: 1.0,
      showLabel: true,
      isClickable: true,
      isVisible: true,
      isCentered: false,
      renderLayer: 'front',
    };
  }

  // If no centered node, treat all as visible (fallback)
  if (!centeredNodeId) {
    return {
      opacity: 1.0,
      showLabel: true,
      isClickable: true,
      isVisible: true,
      isCentered: false,
      renderLayer: 'middle',
    };
  }

  // Check if this is the centered node
  const isCentered = nodeId === centeredNodeId;
  if (isCentered) {
    return {
      opacity: FOG_OPACITY.CENTERED,
      showLabel: true,
      isClickable: true,
      isVisible: true,
      isCentered: true,
      renderLayer: 'front',
    };
  }

  // Get hop distance
  const hopDistance = hopDistances[nodeId];

  // If hop distance unknown, hide (shouldn't happen with proper BFS)
  if (hopDistance === undefined) {
    return {
      opacity: 0,
      showLabel: false,
      isClickable: false,
      isVisible: false,
      isCentered: false,
      renderLayer: 'hidden',
    };
  }

  // Apply fog-of-war rules
  switch (hopDistance) {
    case 1:
      return {
        opacity: FOG_OPACITY.HOP_1,
        showLabel: true,
        isClickable: true,
        isVisible: true,
        isCentered: false,
        renderLayer: 'front',
      };

    case 2:
      return {
        opacity: FOG_OPACITY.HOP_2,
        showLabel: true,
        isClickable: true,
        isVisible: true,
        isCentered: false,
        renderLayer: 'middle',
      };

    case 3:
      return {
        opacity: FOG_OPACITY.HOP_3,
        showLabel: true,
        isClickable: true,
        isVisible: true,
        isCentered: false,
        renderLayer: 'middle',
      };

    case 4:
      return {
        opacity: FOG_OPACITY.HOP_4,
        showLabel: false, // No labels on ghost nodes
        isClickable: false, // Enforced traversal: cannot click
        isVisible: true,
        isCentered: false,
        renderLayer: 'back',
      };

    default:
      // Hop 5+: invisible
      return {
        opacity: FOG_OPACITY.HOP_5_PLUS,
        showLabel: false,
        isClickable: false,
        isVisible: false,
        isCentered: false,
        renderLayer: 'hidden',
      };
  }
}

/**
 * Calculate edge visibility based on both endpoints
 * Edge is visible if BOTH nodes are visible
 * Edge opacity = min(source opacity, target opacity) * multiplier
 */
export function getEdgeVisibility(
  sourceNodeId: string,
  targetNodeId: string,
  centeredNodeId: string | null,
  hopDistances: HopDistanceMap,
  sourceIsGlobalService?: boolean,
  targetIsGlobalService?: boolean
): { opacity: number; isVisible: boolean } {
  const sourceVis = getNodeVisibility(sourceNodeId, centeredNodeId, hopDistances, sourceIsGlobalService);
  const targetVis = getNodeVisibility(targetNodeId, centeredNodeId, hopDistances, targetIsGlobalService);

  // Edge is visible only if both endpoints are visible
  const isVisible = sourceVis.isVisible && targetVis.isVisible;

  // Edge opacity is the minimum of both endpoints, scaled down
  const opacity = Math.min(sourceVis.opacity, targetVis.opacity) * EDGE_OPACITY_MULTIPLIER;

  return { opacity, isVisible };
}

/**
 * Calculate hop distances from a centered node using BFS
 * This is a client-side fallback if database function is unavailable
 */
export function calculateHopDistancesBFS(
  centeredNodeId: string,
  edges: Array<{ from_node_id: string; to_node_id: string }>,
  allNodeIds: string[]
): HopDistanceMap {
  const hopDistances: HopDistanceMap = {};
  const visited = new Set<string>();
  const queue: Array<{ nodeId: string; distance: number }> = [];

  // Start with centered node at distance 0
  queue.push({ nodeId: centeredNodeId, distance: 0 });
  visited.add(centeredNodeId);
  hopDistances[centeredNodeId] = 0;

  // BFS traversal
  while (queue.length > 0) {
    const current = queue.shift()!;

    // Don't traverse beyond hop 6
    if (current.distance >= 6) continue;

    // Find all neighbors (edges are directed, but we treat graph as undirected for visibility)
    const neighbors = edges
      .filter(
        (e) =>
          e.from_node_id === current.nodeId || e.to_node_id === current.nodeId
      )
      .map((e) =>
        e.from_node_id === current.nodeId ? e.to_node_id : e.from_node_id
      );

    for (const neighborId of neighbors) {
      if (!visited.has(neighborId)) {
        visited.add(neighborId);
        hopDistances[neighborId] = current.distance + 1;
        queue.push({ nodeId: neighborId, distance: current.distance + 1 });
      }
    }
  }

  // Nodes not reached are at infinite distance (hop 999)
  for (const nodeId of allNodeIds) {
    if (!(nodeId in hopDistances)) {
      hopDistances[nodeId] = 999;
    }
  }

  return hopDistances;
}

/**
 * Get opacity color modifier for unconfirmed person nodes
 * These should appear ghostly regardless of hop distance
 */
export function getUnconfirmedNodeOpacity(baseOpacity: number): number {
  return Math.min(baseOpacity, FOG_OPACITY.HOP_4);
}

/**
 * Filter nodes and edges for rendering based on visibility
 */
export function filterVisibleElements<T extends { id: string }>(
  elements: T[],
  centeredNodeId: string | null,
  hopDistances: HopDistanceMap
): T[] {
  return elements.filter((element) => {
    const visibility = getNodeVisibility(element.id, centeredNodeId, hopDistances);
    return visibility.isVisible;
  });
}

/**
 * Group nodes by render layer for proper z-ordering
 */
export function groupNodesByLayer(
  nodeIds: string[],
  centeredNodeId: string | null,
  hopDistances: HopDistanceMap
): {
  front: string[];
  middle: string[];
  back: string[];
  hidden: string[];
} {
  const layers = {
    front: [] as string[],
    middle: [] as string[],
    back: [] as string[],
    hidden: [] as string[],
  };

  for (const nodeId of nodeIds) {
    const visibility = getNodeVisibility(nodeId, centeredNodeId, hopDistances);
    layers[visibility.renderLayer].push(nodeId);
  }

  return layers;
}

/**
 * Calculate transition animation duration based on hop distance change
 */
export function getTransitionDuration(oldHop: number, newHop: number): number {
  const hopChange = Math.abs(oldHop - newHop);

  // Longer animation for bigger hop changes
  return Math.min(300 + hopChange * 100, 800);
}
