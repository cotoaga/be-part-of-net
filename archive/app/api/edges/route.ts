import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * POST /api/edges
 * Creates a new edge (connection) between two nodes
 *
 * Request body:
 * {
 *   from_node_id: string,  // user's node
 *   to_node_id: string,    // target node
 *   label?: string         // private relationship tag
 * }
 */
export async function POST(request: Request) {
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

    // Parse request body
    const body = await request.json()
    const { from_node_id, to_node_id, label } = body

    // Validate required fields
    if (!from_node_id || !to_node_id) {
      return NextResponse.json(
        { error: 'Missing required fields: from_node_id, to_node_id' },
        { status: 400 }
      )
    }

    // Validate both nodes exist
    const { data: fromNode, error: fromError } = await supabase
      .from('nodes')
      .select('id')
      .eq('id', from_node_id)
      .single()

    if (fromError || !fromNode) {
      return NextResponse.json(
        { error: 'Source node not found' },
        { status: 404 }
      )
    }

    const { data: toNode, error: toError } = await supabase
      .from('nodes')
      .select('id')
      .eq('id', to_node_id)
      .single()

    if (toError || !toNode) {
      return NextResponse.json(
        { error: 'Target node not found' },
        { status: 404 }
      )
    }

    // Create the edge
    const edgeData = {
      from_node_id,
      to_node_id,
      label: label?.trim() || null,
      created_by: user.id,
      is_demo: false
    }

    const { data: edge, error: insertError } = await supabase
      .from('edges')
      .insert(edgeData)
      .select()
      .single()

    if (insertError) {
      console.error('Error creating edge:', insertError)

      // Handle unique constraint violation (duplicate edge)
      if (insertError.code === '23505') {
        return NextResponse.json(
          { error: 'Connection already exists between these nodes' },
          { status: 409 }
        )
      }

      return NextResponse.json(
        {
          error: 'Failed to create edge',
          details: insertError.message,
          code: insertError.code
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      edge
    })

  } catch (error) {
    console.error('Error in POST /api/edges:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error },
      { status: 500 }
    )
  }
}
