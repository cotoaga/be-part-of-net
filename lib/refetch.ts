import type { SupabaseClient } from '@supabase/supabase-js';
import type { Node, Edge } from '@/types';

/**
 * Soft refetch graph data from Supabase
 *
 * This function refetches nodes and edges from the database and updates
 * the component state WITHOUT causing a full page reload.
 *
 * Key benefit: Preserves graph physics state (node positions, velocities)
 * because GraphCanvas's useMemo will maintain existing GraphNode objects
 * and only update their data properties.
 *
 * @param supabase - Supabase client instance
 * @param setNodes - State setter for nodes array
 * @param setEdges - State setter for edges array
 * @returns Success/error status
 */
export async function softRefetchGraphData(
  supabase: SupabaseClient,
  setNodes: (nodes: Node[]) => void,
  setEdges: (edges: Edge[]) => void
): Promise<{ success: boolean; error?: any }> {
  try {
    // Fetch both in parallel for performance
    const [nodesRes, edgesRes] = await Promise.all([
      supabase.from('nodes').select('*').order('created_at', { ascending: true }),
      supabase.from('edges').select('*'),
    ]);

    // Handle errors
    if (nodesRes.error) {
      console.error('Failed to fetch nodes:', nodesRes.error);
      return { success: false, error: nodesRes.error };
    }

    if (edgesRes.error) {
      console.error('Failed to fetch edges:', edgesRes.error);
      return { success: false, error: edgesRes.error };
    }

    // Update state
    if (nodesRes.data) setNodes(nodesRes.data);
    if (edgesRes.data) setEdges(edgesRes.data);

    return { success: true };
  } catch (error) {
    console.error('Unexpected error during refetch:', error);
    return { success: false, error };
  }
}

/**
 * Helper to create a refetch function bound to specific state setters
 * Use this in NetworkView to create a reusable refetch callback
 *
 * @example
 * const handleRefetch = useCallback(() => {
 *   return createRefetchHandler(supabase, setNodes, setEdges)();
 * }, [setNodes, setEdges]);
 */
export function createRefetchHandler(
  supabase: SupabaseClient,
  setNodes: (nodes: Node[]) => void,
  setEdges: (edges: Edge[]) => void
) {
  return () => softRefetchGraphData(supabase, setNodes, setEdges);
}
