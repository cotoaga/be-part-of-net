import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Test nodes for "Zaphod's Zoo" demo (NEW schema format)
const TEST_NODES = [
  {
    type: "person",
    name: "Zaphod Beeblebrox",
    description: "The Man, The Myth, The Two Heads",
    url: "https://heart-of-gold.galaxy",
    is_demo: true,
    confirmed: true,
    controlled_by: [] as string[], // Will be set to current user later
  },
  {
    type: "app",
    name: "Marvin",
    description: "The Paranoid Android",
    endpoint_url: "mcp://sirius-cybernetics.corp/marvin",
    is_demo: true,
    confirmed: true,
    controlled_by: [] as string[],
  },
  {
    type: "person",
    name: "Ford Prefect",
    description: "Ix",
    url: "https://betelgeuse-seven.galaxy",
    is_demo: true,
    confirmed: true,
    controlled_by: [] as string[],
  },
  {
    type: "person",
    name: "Arthur Dent",
    description: "The Last Man from Earth",
    url: "https://earth.nostalgic",
    is_demo: true,
    confirmed: true,
    controlled_by: [] as string[],
  },
  {
    type: "person",
    name: "Trillian",
    description: "Tricia McMillan",
    url: "https://astrophysics.academy",
    is_demo: true,
    confirmed: true,
    controlled_by: [] as string[],
  },
  {
    type: "person",
    name: "Slartibartfast",
    description: "The Fjord Designer",
    url: "https://magrathea.planet-builders",
    is_demo: true,
    confirmed: true,
    controlled_by: [] as string[],
  },
  {
    type: "app",
    name: "Deep Thought",
    description: "The Ultimate Computer",
    endpoint_url: "mcp://hyperspace.network/deep-thought",
    is_demo: true,
    confirmed: true,
    controlled_by: [] as string[],
  },
  {
    type: "app",
    name: "Eddie",
    description: "Heart of Gold Ship Computer",
    endpoint_url: "mcp://heart-of-gold.galaxy/eddie",
    is_demo: true,
    confirmed: true,
    controlled_by: [] as string[],
  },
  {
    type: "person",
    name: "Prostetnic Vogon Jeltz",
    description: "The Vogon Captain",
    url: "https://vogon-constructor-fleet.gov",
    is_demo: true,
    confirmed: true,
    controlled_by: [] as string[],
  },
  {
    type: "person",
    name: "Fenchurch",
    description: "The Girl Who Vanished",
    url: "https://london.earth",
    is_demo: true,
    confirmed: true,
    controlled_by: [] as string[],
  },
  {
    type: "person",
    name: "Random Dent",
    description: "Daughter of Arthur",
    url: "https://random-adventures.galaxy",
    is_demo: true,
    confirmed: true,
    controlled_by: [] as string[],
  },
  {
    type: "person",
    name: "Agrajag",
    description: "The Perpetually Reincarnating",
    url: "https://cathedral-of-hate.afterlife",
    is_demo: true,
    confirmed: true,
    controlled_by: [] as string[],
  }
]

const TEST_EDGES = [
  { source: "Zaphod Beeblebrox", target: "Ford Prefect", label: "co-conspirator" },
  { source: "Zaphod Beeblebrox", target: "Trillian", label: "ex-relationship" },
  { source: "Zaphod Beeblebrox", target: "Marvin", label: "ship-crew" },
  { source: "Zaphod Beeblebrox", target: "Eddie", label: "ship-crew" },
  { source: "Ford Prefect", target: "Arthur Dent", label: "best-friend" },
  { source: "Ford Prefect", target: "Trillian", label: "colleague" },
  { source: "Arthur Dent", target: "Trillian", label: "friend" },
  { source: "Arthur Dent", target: "Marvin", label: "travels-with" },
  { source: "Arthur Dent", target: "Slartibartfast", label: "guide" },
  { source: "Arthur Dent", target: "Fenchurch", label: "romantic" },
  { source: "Arthur Dent", target: "Random Dent", label: "father" },
  { source: "Deep Thought", target: "Slartibartfast", label: "creator" },
  { source: "Deep Thought", target: "Marvin", label: "predecessor" },
  { source: "Eddie", target: "Marvin", label: "fellow-ai" },
  { source: "Prostetnic Vogon Jeltz", target: "Arthur Dent", label: "nemesis" },
  { source: "Agrajag", target: "Arthur Dent", label: "victim-of" },
  { source: "Random Dent", target: "Trillian", label: "daughter" },
  { source: "Slartibartfast", target: "Trillian", label: "works-with" },
]

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

    // Step 1: Delete existing demo nodes and edges first (clean slate)
    await supabase.from('edges').delete().eq('is_demo', true)
    await supabase.from('nodes').delete().eq('is_demo', true)

    // Step 2: Insert all test nodes (NEW schema)
    const { data: insertedNodes, error: nodesError } = await supabase
      .from('nodes')
      .insert(TEST_NODES)
      .select()

    if (nodesError) {
      console.error('Error inserting nodes:', nodesError)
      return NextResponse.json(
        {
          error: 'Failed to create test nodes',
          details: nodesError.message || nodesError,
          code: nodesError.code,
          hint: nodesError.hint
        },
        { status: 500 }
      )
    }

    // Step 3: Link current user to Zaphod (add user.id to controlled_by array)
    const zaphodNode = insertedNodes?.find(n => n.name === 'Zaphod Beeblebrox')
    if (zaphodNode) {
      const { error: updateError } = await supabase
        .from('nodes')
        .update({
          controlled_by: [user.id],
          email: user.email
        })
        .eq('id', zaphodNode.id)

      if (updateError) {
        console.error('Error linking user to Zaphod:', updateError)
      }
    }

    // Step 4: Create node lookup map
    const nodeMap = new Map(
      insertedNodes?.map(node => [node.name, node.id]) || []
    )

    // Step 5: Insert edges with actual node IDs (NEW schema)
    const edgesToInsert = TEST_EDGES.map(edge => ({
      from_node_id: nodeMap.get(edge.source),
      to_node_id: nodeMap.get(edge.target),
      label: edge.label,
      created_by: null, // Demo data has no creator
      is_demo: true
    })).filter(edge => edge.from_node_id && edge.to_node_id)

    const { data: insertedEdges, error: edgesError } = await supabase
      .from('edges')
      .insert(edgesToInsert)
      .select()

    if (edgesError) {
      console.error('Error inserting edges:', edgesError)
      // Don't fail if edges fail - nodes are more important
    }

    return NextResponse.json({
      success: true,
      message: "DON'T PANIC - Zaphod's Zoo initialized!",
      stats: {
        nodes_created: insertedNodes?.length || 0,
        edges_created: insertedEdges?.length || 0,
        user_is_now: "Zaphod Beeblebrox"
      }
    })

  } catch (error) {
    console.error('Pan-Galactic Gargle Blaster error:', error)
    return NextResponse.json(
      { error: 'Test mode initialization failed', details: error },
      { status: 500 }
    )
  }
}
