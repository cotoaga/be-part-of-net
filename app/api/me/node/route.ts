import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * GET /api/me/node
 * Returns the current user's person node
 */
export async function GET() {
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

    // Find the user's person node (controlled_by contains user ID)
    const { data: node, error: nodeError } = await supabase
      .from('nodes')
      .select('id, name, type, description, email, url, confirmed, controlled_by')
      .contains('controlled_by', [user.id])
      .eq('type', 'person')
      .eq('is_demo', false)
      .maybeSingle()

    if (nodeError) {
      console.error('Error fetching user node:', nodeError)
      return NextResponse.json(
        { error: 'Failed to fetch user node', details: nodeError.message },
        { status: 500 }
      )
    }

    if (!node) {
      return NextResponse.json(
        { error: 'User node not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      node
    })

  } catch (error) {
    console.error('Error in /api/me/node:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error },
      { status: 500 }
    )
  }
}
