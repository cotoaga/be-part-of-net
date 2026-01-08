import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { updateNodeSchema } from '@/lib/api/validation';
import { errorResponse, ApiErrors } from '@/lib/api/errors';
import { requireAuth, requireOwnership, canDeleteNode } from '@/lib/api/auth';

/**
 * GET /api/nodes/[id]
 * Fetch a single node by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Fetch node
    const { data: node, error } = await supabase
      .from('nodes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Failed to fetch node:', error);
      throw ApiErrors.notFound('Node not found');
    }

    return NextResponse.json({
      success: true,
      node,
    });
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * PATCH /api/nodes/[id]
 * Update a node's attributes
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const user = await requireAuth(supabase);
    const { id } = await params;

    // Verify ownership
    await requireOwnership(supabase, 'nodes', id, user);

    // Parse and validate request body
    const body = await request.json();
    const validated = updateNodeSchema.parse(body);

    // Check if there's anything to update
    if (Object.keys(validated).length === 0) {
      throw ApiErrors.validation('No fields to update');
    }

    // Update node
    const { data: node, error } = await supabase
      .from('nodes')
      .update({
        ...validated,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Failed to update node:', error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      node,
    });
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * DELETE /api/nodes/[id]
 * Delete a node (only url/mcp nodes, not person nodes)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const user = await requireAuth(supabase);
    const { id } = await params;

    // Check deletion permissions (ownership + type check)
    await canDeleteNode(supabase, id, user);

    // Delete node (edges will cascade delete due to DB constraints)
    const { error } = await supabase.from('nodes').delete().eq('id', id);

    if (error) {
      console.error('Failed to delete node:', error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: 'Node deleted successfully',
    });
  } catch (error) {
    return errorResponse(error);
  }
}
