import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createEdgeSchema, validateRelationTypes } from '@/lib/api/validation';
import { errorResponse, ApiErrors } from '@/lib/api/errors';
import { requireAuth, getCreatorId } from '@/lib/api/auth';
import type { NodeType } from '@/types';

/**
 * POST /api/edges
 * Create a new edge between two nodes
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const user = await requireAuth(supabase);

    // Parse and validate request body
    const body = await request.json();
    const validated = createEdgeSchema.parse(body);

    // Fetch both nodes to validate they exist and check relation type compatibility
    const { data: nodes, error: nodesError } = await supabase
      .from('nodes')
      .select('id, type')
      .in('id', [validated.from_node_id, validated.to_node_id]);

    if (nodesError || !nodes || nodes.length !== 2) {
      throw ApiErrors.notFound('One or both nodes not found');
    }

    // Map nodes by ID
    const fromNode = nodes.find((n) => n.id === validated.from_node_id);
    const toNode = nodes.find((n) => n.id === validated.to_node_id);

    if (!fromNode || !toNode) {
      throw ApiErrors.notFound('One or both nodes not found');
    }

    // Validate relation type is compatible with node types
    const isValid = validateRelationTypes(
      validated.relation,
      fromNode.type as NodeType,
      toNode.type as NodeType
    );

    if (!isValid) {
      throw ApiErrors.unprocessable(
        `Relation '${validated.relation}' is not valid between ${fromNode.type} and ${toNode.type} nodes`
      );
    }

    // Check for duplicate edge (same from, to, relation)
    const { data: existingEdge } = await supabase
      .from('edges')
      .select('id')
      .eq('from_node_id', validated.from_node_id)
      .eq('to_node_id', validated.to_node_id)
      .eq('relation', validated.relation)
      .maybeSingle();

    if (existingEdge) {
      return NextResponse.json(
        {
          error: 'This edge already exists',
          code: 'DUPLICATE_EDGE',
          existingEdgeId: existingEdge.id,
        },
        { status: 409 }
      );
    }

    // Get creator ID (user's node ID or auth ID)
    const creatorId = await getCreatorId(supabase, user);

    // Create edge
    const { data: edge, error } = await supabase
      .from('edges')
      .insert({
        from_node_id: validated.from_node_id,
        to_node_id: validated.to_node_id,
        relation: validated.relation,
        created_by: creatorId,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create edge:', error);
      throw error;
    }

    return NextResponse.json(
      {
        success: true,
        edge,
      },
      { status: 201 }
    );
  } catch (error) {
    return errorResponse(error);
  }
}
