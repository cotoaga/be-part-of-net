import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * DELETE /api/nodes/:id
 * Deletes a node (only if you control it)
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Authentication required' },
        { status: 401 }
      )
    }

    const { id } = await params

    // Get the node to check ownership
    const { data: node, error: fetchError } = await supabase
      .from('nodes')
      .select('id, type, controlled_by')
      .eq('id', id)
      .single()

    if (fetchError || !node) {
      return NextResponse.json(
        { error: 'Node not found' },
        { status: 404 }
      )
    }

    // Check if user controls this node
    if (!node.controlled_by?.includes(user.id)) {
      return NextResponse.json(
        { error: 'Unauthorized - You do not control this node' },
        { status: 403 }
      )
    }

    // Don't allow deleting person nodes (your identity)
    if (node.type === 'person') {
      return NextResponse.json(
        { error: 'Cannot delete person nodes' },
        { status: 400 }
      )
    }

    // Delete the node (edges will cascade delete due to FK constraint)
    const { error: deleteError } = await supabase
      .from('nodes')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Error deleting node:', deleteError)
      return NextResponse.json(
        {
          error: 'Failed to delete node',
          details: deleteError.message,
          code: deleteError.code
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Node deleted successfully'
    })

  } catch (error) {
    console.error('Error in DELETE /api/nodes/:id:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error },
      { status: 500 }
    )
  }
}
