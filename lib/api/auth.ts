import type { SupabaseClient, User } from '@supabase/supabase-js';
import { ApiErrors } from './errors';

/**
 * Requires authentication and returns the authenticated user
 * Throws APIError if not authenticated
 */
export async function requireAuth(supabase: SupabaseClient): Promise<User> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw ApiErrors.unauthorized();
  }

  return user;
}

/**
 * Gets the node ID for a user's person node
 * Returns null if user doesn't have an associated node
 */
export async function getUserNodeId(
  supabase: SupabaseClient,
  userEmail: string
): Promise<string | null> {
  const { data } = await supabase
    .from('nodes')
    .select('id')
    .eq('type', 'person')
    .eq('email', userEmail)
    .maybeSingle();

  return data?.id || null;
}

/**
 * Requires ownership of a resource (node or edge)
 * Throws APIError if user doesn't own the resource
 *
 * Note: created_by can be either a node ID (UUID) or auth user ID (UUID)
 * This function checks against the user's node ID if it exists, otherwise against auth.uid()
 */
export async function requireOwnership(
  supabase: SupabaseClient,
  table: 'nodes' | 'edges',
  resourceId: string,
  user: User
): Promise<void> {
  // Get the resource
  const { data, error } = await supabase
    .from(table)
    .select('created_by')
    .eq('id', resourceId)
    .maybeSingle();

  if (error || !data) {
    throw ApiErrors.notFound(table.slice(0, -1)); // 'node' or 'edge'
  }

  // Check if user owns it (either via node ID or auth ID)
  const userNodeId = await getUserNodeId(supabase, user.email!);
  const isOwner = data.created_by === userNodeId || data.created_by === user.id;

  if (!isOwner) {
    throw ApiErrors.forbidden('You do not own this resource');
  }
}

/**
 * Gets the creator ID to use for new resources
 * Prefers the user's node ID if they have one, otherwise uses auth.uid()
 */
export async function getCreatorId(supabase: SupabaseClient, user: User): Promise<string> {
  const nodeId = await getUserNodeId(supabase, user.email!);
  return nodeId || user.id;
}

/**
 * Checks if a user has permission to delete a node
 * - Must be the creator
 * - Cannot delete person nodes (only url/mcp)
 */
export async function canDeleteNode(
  supabase: SupabaseClient,
  nodeId: string,
  user: User
): Promise<void> {
  const { data, error } = await supabase
    .from('nodes')
    .select('type, created_by')
    .eq('id', nodeId)
    .maybeSingle();

  if (error || !data) {
    throw ApiErrors.notFound('Node');
  }

  // Check type - cannot delete person nodes
  if (data.type === 'person') {
    throw ApiErrors.forbidden('Cannot delete person nodes');
  }

  // Check ownership
  const userNodeId = await getUserNodeId(supabase, user.email!);
  const isOwner = data.created_by === userNodeId || data.created_by === user.id;

  if (!isOwner) {
    throw ApiErrors.forbidden('You do not own this node');
  }
}

/**
 * Checks if a user has permission to delete an edge
 * - Must be the creator
 * - Cannot delete 'invited' edges (permanent provenance)
 */
export async function canDeleteEdge(
  supabase: SupabaseClient,
  edgeId: string,
  user: User
): Promise<void> {
  const { data, error } = await supabase
    .from('edges')
    .select('relation, created_by')
    .eq('id', edgeId)
    .maybeSingle();

  if (error || !data) {
    throw ApiErrors.notFound('Edge');
  }

  // Check relation - cannot delete invited edges
  if (data.relation === 'invited') {
    throw ApiErrors.forbidden('Cannot delete invitation edges');
  }

  // Check ownership
  const userNodeId = await getUserNodeId(supabase, user.email!);
  const isOwner = data.created_by === userNodeId || data.created_by === user.id;

  if (!isOwner) {
    throw ApiErrors.forbidden('You do not own this edge');
  }
}
