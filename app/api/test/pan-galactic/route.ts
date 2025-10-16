import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const TEST_NODES = [
  {
    node_name: "Zaphod Beeblebrox",
    node_aka: "The Man, The Myth, The Two Heads",
    node_type: "human",
    temperature: 10.0,
    coherence_level: 42.0,
    node_url: "https://heart-of-gold.galaxy",
    status: "active"
  },
  {
    node_name: "Marvin",
    node_aka: "The Paranoid Android",
    node_type: "ai",
    temperature: 0.5,
    coherence_level: 99.9,
    mcp_endpoint: "mcp://sirius-cybernetics.corp/marvin",
    status: "active"
  },
  {
    node_name: "Ford Prefect",
    node_aka: "Ix",
    node_type: "human",
    temperature: 7.0,
    coherence_level: 75.0,
    node_url: "https://betelgeuse-seven.galaxy",
    status: "active"
  },
  {
    node_name: "Arthur Dent",
    node_aka: "The Last Man from Earth",
    node_type: "human",
    temperature: 5.0,
    coherence_level: 30.0,
    node_url: "https://earth.nostalgic",
    status: "active"
  },
  {
    node_name: "Trillian",
    node_aka: "Tricia McMillan",
    node_type: "human",
    temperature: 6.5,
    coherence_level: 85.0,
    node_url: "https://astrophysics.academy",
    status: "active"
  },
  {
    node_name: "Slartibartfast",
    node_aka: "The Fjord Designer",
    node_type: "human",
    temperature: 1.0,
    coherence_level: 92.0,
    node_url: "https://magrathea.planet-builders",
    status: "active"
  },
  {
    node_name: "Deep Thought",
    node_aka: "The Ultimate Computer",
    node_type: "ai",
    temperature: 0.0,
    coherence_level: 100.0,
    mcp_endpoint: "mcp://hyperspace.network/deep-thought",
    status: "active"
  },
  {
    node_name: "Eddie",
    node_aka: "Heart of Gold Ship Computer",
    node_type: "ai",
    temperature: 9.0,
    coherence_level: 88.0,
    mcp_endpoint: "mcp://heart-of-gold.galaxy/eddie",
    status: "active"
  },
  {
    node_name: "Prostetnic Vogon Jeltz",
    node_aka: "The Vogon Captain",
    node_type: "human",
    temperature: 3.0,
    coherence_level: 45.0,
    node_url: "https://vogon-constructor-fleet.gov",
    status: "active"
  },
  {
    node_name: "Fenchurch",
    node_aka: "The Girl Who Vanished",
    node_type: "human",
    temperature: 4.0,
    coherence_level: 70.0,
    node_url: "https://london.earth",
    status: "active"
  },
  {
    node_name: "Random Dent",
    node_aka: "Daughter of Arthur",
    node_type: "human",
    temperature: 8.5,
    coherence_level: 55.0,
    node_url: "https://random-adventures.galaxy",
    status: "active"
  },
  {
    node_name: "Agrajag",
    node_aka: "The Perpetually Reincarnating",
    node_type: "human",
    temperature: 2.0,
    coherence_level: 25.0,
    node_url: "https://cathedral-of-hate.afterlife",
    status: "active"
  }
]

const TEST_EDGES = [
  { source: "Zaphod Beeblebrox", target: "Ford Prefect" },
  { source: "Zaphod Beeblebrox", target: "Trillian" },
  { source: "Zaphod Beeblebrox", target: "Marvin" },
  { source: "Zaphod Beeblebrox", target: "Eddie" },
  { source: "Ford Prefect", target: "Arthur Dent" },
  { source: "Ford Prefect", target: "Trillian" },
  { source: "Arthur Dent", target: "Trillian" },
  { source: "Arthur Dent", target: "Marvin" },
  { source: "Arthur Dent", target: "Slartibartfast" },
  { source: "Arthur Dent", target: "Fenchurch" },
  { source: "Arthur Dent", target: "Random Dent" },
  { source: "Deep Thought", target: "Slartibartfast" },
  { source: "Deep Thought", target: "Marvin" },
  { source: "Eddie", target: "Marvin" },
  { source: "Prostetnic Vogon Jeltz", target: "Arthur Dent" },
  { source: "Agrajag", target: "Arthur Dent" },
  { source: "Random Dent", target: "Trillian" },
  { source: "Slartibartfast", target: "Trillian" },
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

    // Step 1: Insert all test nodes
    const { data: insertedNodes, error: nodesError } = await supabase
      .from('consciousness_nodes')
      .upsert(TEST_NODES, { onConflict: 'node_name', ignoreDuplicates: false })
      .select()

    if (nodesError) {
      console.error('Error inserting nodes:', nodesError)
      return NextResponse.json(
        { error: 'Failed to create test nodes', details: nodesError },
        { status: 500 }
      )
    }

    // Step 2: Link current user to Zaphod
    const zaphodNode = insertedNodes?.find(n => n.node_name === 'Zaphod Beeblebrox')
    if (zaphodNode) {
      const { error: updateError } = await supabase
        .from('consciousness_nodes')
        .update({
          auth_user_id: user.id,
          node_email: user.email
        })
        .eq('id', zaphodNode.id)

      if (updateError) {
        console.error('Error linking user to Zaphod:', updateError)
      }
    }

    // Step 3: Create node lookup map
    const nodeMap = new Map(
      insertedNodes?.map(node => [node.node_name, node.id]) || []
    )

    // Step 4: Insert edges with actual node IDs
    const edgesToInsert = TEST_EDGES.map(edge => ({
      source_node_id: nodeMap.get(edge.source),
      target_node_id: nodeMap.get(edge.target),
      edge_type: 'connection'
    })).filter(edge => edge.source_node_id && edge.target_node_id)

    const { data: insertedEdges, error: edgesError } = await supabase
      .from('consciousness_edges')
      .upsert(edgesToInsert, {
        onConflict: 'source_node_id,target_node_id',
        ignoreDuplicates: true
      })
      .select()

    if (edgesError) {
      console.error('Error inserting edges:', edgesError)
      // Don't fail if edges fail - nodes are more important
    }

    return NextResponse.json({
      success: true,
      message: "DON'T PANIC - Test network initialized!",
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
