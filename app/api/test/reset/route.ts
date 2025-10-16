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
      .from('consciousness_edges')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

    if (edgesError) {
      console.error('Error deleting edges:', edgesError)
    }

    // Delete all nodes
    const { error: nodesError } = await supabase
      .from('consciousness_nodes')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

    if (nodesError) {
      console.error('Error deleting nodes:', nodesError)
      return NextResponse.json(
        { error: 'Failed to reset network', details: nodesError },
        { status: 500 }
      )
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
