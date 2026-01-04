import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { errorResponse } from '@/lib/api/errors';
import { requireAuth, canDeleteEdge } from '@/lib/api/auth';

/**
 * DELETE /api/edges/[id]
 * Delete an edge (cannot delete 'invited' edges)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const user = await requireAuth(supabase);
    const { id } = await params;

    // Check deletion permissions (ownership + relation check)
    await canDeleteEdge(supabase, id, user);

    // Delete edge
    const { error } = await supabase.from('edges').delete().eq('id', id);

    if (error) {
      console.error('Failed to delete edge:', error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: 'Edge deleted successfully',
    });
  } catch (error) {
    return errorResponse(error);
  }
}
