import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * POST /api/nodes
 * Creates a new node (app or mcp)
 *
 * Request body:
 * {
 *   type: 'app' | 'mcp',
 *   name: string,
 *   description?: string,
 *   url?: string,
 *   endpoint_url?: string  // for MCP type
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
    const { type, name, description, url, endpoint_url } = body

    // Validate required fields
    if (!type || !name) {
      return NextResponse.json(
        { error: 'Missing required fields: type, name' },
        { status: 400 }
      )
    }

    // Validate type
    if (type !== 'app' && type !== 'mcp') {
      return NextResponse.json(
        { error: 'Invalid type. Must be "app" or "mcp"' },
        { status: 400 }
      )
    }

    // Create the node
    const nodeData = {
      type,
      name: name.trim(),
      description: description?.trim() || null,
      url: url?.trim() || null,
      endpoint_url: endpoint_url?.trim() || null,
      controlled_by: [user.id],
      confirmed: true,
      is_demo: false
    }

    const { data: node, error: insertError } = await supabase
      .from('nodes')
      .insert(nodeData)
      .select()
      .single()

    if (insertError) {
      console.error('Error creating node:', insertError)
      return NextResponse.json(
        {
          error: 'Failed to create node',
          details: insertError.message,
          code: insertError.code
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      node
    })

  } catch (error) {
    console.error('Error in POST /api/nodes:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error },
      { status: 500 }
    )
  }
}
