import { z } from 'zod';
import type { NodeType, RelationType } from '@/types';

// Shared schemas
export const nodeTypeSchema = z.enum(['person', 'url', 'mcp']);
export const relationTypeSchema = z.enum(['invited', 'knowing', 'working_with', 'created', 'using']);
export const uuidSchema = z.string().uuid();

// Node creation schema
export const createNodeSchema = z.object({
  type: nodeTypeSchema,
  name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or less').trim(),
  description: z.string().max(500, 'Description must be 500 characters or less').optional().nullable(),
  email: z.string().email('Invalid email format').optional().nullable(),
  url: z.string().url('Invalid URL format').optional().nullable(),
  invited_by: uuidSchema.optional().nullable(),
}).refine(
  (data) => {
    // Person must have email
    if (data.type === 'person' && !data.email) {
      return false;
    }
    // URL/MCP must have url
    if ((data.type === 'url' || data.type === 'mcp') && !data.url) {
      return false;
    }
    return true;
  },
  {
    message: 'Person nodes require email, URL/MCP nodes require url',
  }
);

// Node update schema (partial, all fields optional)
export const updateNodeSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or less').trim().optional(),
  description: z.string().max(500, 'Description must be 500 characters or less').optional().nullable(),
  email: z.string().email('Invalid email format').optional().nullable(),
  url: z.string().url('Invalid URL format').optional().nullable(),
});

// Edge creation schema
export const createEdgeSchema = z.object({
  from_node_id: uuidSchema,
  to_node_id: uuidSchema,
  relation: relationTypeSchema,
}).refine(
  (data) => data.from_node_id !== data.to_node_id,
  {
    message: 'Cannot create edge from node to itself',
    path: ['to_node_id'],
  }
);

// Search query schema
export const searchNodesSchema = z.object({
  q: z.string().optional(),
  url: z.string().optional(),
  type: z.string().optional(), // Comma-separated types
});

/**
 * Validates relation type compatibility with node types
 *
 * Rules:
 * - invited: person → person
 * - knowing: person → person
 * - working_with: person → person
 * - created: person → url/mcp
 * - using: person → url/mcp
 */
export function validateRelationTypes(
  relation: RelationType,
  sourceType: NodeType,
  targetType: NodeType
): boolean {
  const rules: Record<RelationType, boolean> = {
    invited: sourceType === 'person' && targetType === 'person',
    knowing: sourceType === 'person' && targetType === 'person',
    working_with: sourceType === 'person' && targetType === 'person',
    created: sourceType === 'person' && (targetType === 'url' || targetType === 'mcp'),
    using: sourceType === 'person' && (targetType === 'url' || targetType === 'mcp'),
  };

  return rules[relation] || false;
}

/**
 * Type inference helpers for validated data
 */
export type CreateNodeInput = z.infer<typeof createNodeSchema>;
export type UpdateNodeInput = z.infer<typeof updateNodeSchema>;
export type CreateEdgeInput = z.infer<typeof createEdgeSchema>;
export type SearchNodesInput = z.infer<typeof searchNodesSchema>;
