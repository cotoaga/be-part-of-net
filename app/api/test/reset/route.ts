import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Delete all edges first (foreign key constraint)
    const { error: edgesError } = await supabase
      .from('edges')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

    if (edgesError) {
      console.error('Error deleting edges:', edgesError)
    }

    // Delete all nodes
    const { error: nodesError } = await supabase
      .from('nodes')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

    if (nodesError) {
      console.error('Error deleting nodes:', nodesError)
      return NextResponse.json(
        { error: 'Failed to reset network', details: nodesError },
        { status: 500 }
      )
    }

    // Also delete users (will cascade to auth.users via ON DELETE CASCADE)
    const { error: usersError } = await supabase
      .from('users')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

    if (usersError) {
      console.error('Error deleting users:', usersError)
      // Don't fail the request - users deletion is optional
    }

    return NextResponse.json({
      success: true,
      message: "Network reset - clean slate achieved"
    })

  } catch (error) {
    console.error('Reset error:', error)
    return NextResponse.json(
      { error: 'Reset failed', details: error },
      { status: 500 }
    )
  }
}
