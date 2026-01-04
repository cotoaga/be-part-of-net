import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { errorResponse, ApiErrors } from '@/lib/api/errors';

/**
 * GET /api/nodes/[id]/edges
 * Get all edges for a specific node (both incoming and outgoing)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Verify node exists and get all fields
    const { data: node, error: nodeError } = await supabase
      .from('nodes')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (nodeError || !node) {
      throw ApiErrors.notFound('Node');
    }

    // Fetch outgoing edges (where this node is the source)
    const { data: outgoing, error: outgoingError } = await supabase
      .from('edges')
      .select(`
        *,
        to_node:nodes!edges_to_node_id_fkey(id, name, type)
      `)
      .eq('from_node_id', id);

    if (outgoingError) {
      console.error('Failed to fetch outgoing edges:', outgoingError);
      throw outgoingError;
    }

    // Fetch incoming edges (where this node is the target)
    const { data: incoming, error: incomingError } = await supabase
      .from('edges')
      .select(`
        *,
        from_node:nodes!edges_from_node_id_fkey(id, name, type)
      `)
      .eq('to_node_id', id);

    if (incomingError) {
      console.error('Failed to fetch incoming edges:', incomingError);
      throw incomingError;
    }

    // All edges (combined)
    const allEdges = [...(outgoing || []), ...(incoming || [])];

    return NextResponse.json({
      success: true,
      node,
      edges: {
        all: allEdges,
        outgoing: outgoing || [],
        incoming: incoming || [],
      },
      count: {
        total: allEdges.length,
        outgoing: outgoing?.length || 0,
        incoming: incoming?.length || 0,
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
