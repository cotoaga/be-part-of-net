import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const supabase = await createClient();

    // Check if user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use admin client to bypass RLS
    const adminClient = createAdminClient();

    // Delete all edges first (to avoid foreign key constraints)
    const { error: deleteEdgesError } = await adminClient
      .from('edges')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Dummy condition to delete all

    if (deleteEdgesError) {
      console.error('Delete edges error:', deleteEdgesError);
      return NextResponse.json(
        { error: `Failed to delete edges: ${deleteEdgesError.message}` },
        { status: 500 }
      );
    }

    // Delete all nodes
    const { error: deleteNodesError } = await adminClient
      .from('nodes')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Dummy condition to delete all

    if (deleteNodesError) {
      console.error('Delete nodes error:', deleteNodesError);
      return NextResponse.json(
        { error: `Failed to delete nodes: ${deleteNodesError.message}` },
        { status: 500 }
      );
    }

    // Insert Kurt (ROOT - no invited_by)
    // Using valid RFC 4122 UUID v4 format (version=4, variant=8)
    const { data: kurt, error: kurtError } = await adminClient
      .from('nodes')
      .insert({
        id: '00000000-0000-4000-8000-000000000001',
        type: 'person',
        name: 'Kurt',
        email: 'kurt@cotoaga.net',
        description: 'Root node, network origin',
        invited_by: null,
        created_by: null,
      })
      .select()
      .single();

    if (kurtError) {
      console.error('Kurt insert error:', kurtError);
      return NextResponse.json(
        { error: `Failed to create Kurt: ${kurtError.message}` },
        { status: 500 }
      );
    }

    // Insert other persons
    // Using valid RFC 4122 UUID v4 format (version=4, variant=8)
    const persons = [
      { id: '00000000-0000-4000-8000-000000000002', name: 'Alice', email: 'alice@example.com', invited_by: kurt?.id },
      { id: '00000000-0000-4000-8000-000000000003', name: 'Bob', email: 'bob@example.com', invited_by: '00000000-0000-4000-8000-000000000002' },
      { id: '00000000-0000-4000-8000-000000000004', name: 'Dave', email: 'dave@example.com', invited_by: kurt?.id },
      { id: '00000000-0000-4000-8000-000000000005', name: 'Carol', email: 'carol@example.com', invited_by: '00000000-0000-4000-8000-000000000004' },
      { id: '00000000-0000-4000-8000-000000000006', name: 'Eddie', email: 'eddie@example.com', invited_by: kurt?.id },
      { id: '00000000-0000-4000-8000-000000000009', name: 'Freddy', email: 'freddy@example.com', invited_by: '00000000-0000-4000-8000-000000000006' },
      { id: '00000000-0000-4000-8000-00000000000a', name: 'Garry', email: 'garry@example.com', invited_by: '00000000-0000-4000-8000-000000000009' },
      { id: '00000000-0000-4000-8000-00000000000b', name: 'Harry', email: 'harry@example.com', invited_by: '00000000-0000-4000-8000-00000000000a' },
    ];

    const { error: personsError } = await adminClient.from('nodes').insert(
      persons.map((p) => ({
        ...p,
        type: 'person',
        description: `Test node: ${p.name}`,
        created_by: null,
      }))
    );

    if (personsError) {
      console.error('Persons insert error:', personsError);
      return NextResponse.json(
        { error: `Failed to create persons: ${personsError.message}` },
        { status: 500 }
      );
    }

    // Insert URL nodes
    const urlNodes = [
      {
        id: '00000000-0000-4000-8000-000000000007',
        name: "Bob's Website",
        url: 'https://bob.example.com',
        description: "Bob's personal website",
        created_by: '00000000-0000-4000-8000-000000000003',
      },
      {
        id: '00000000-0000-4000-8000-000000000008',
        name: 'be-part-of.net',
        url: 'https://be-part-of.net',
        description: 'The anti-social social network - this very platform (self-reference)',
        created_by: '00000000-0000-4000-8000-000000000001',
      },
    ];

    const { error: urlError } = await adminClient.from('nodes').insert(
      urlNodes.map((u) => ({
        ...u,
        type: 'url',
      }))
    );

    if (urlError) {
      console.error('URL nodes insert error:', urlError);
      return NextResponse.json(
        { error: `Failed to create URL nodes: ${urlError.message}` },
        { status: 500 }
      );
    }

    // Insert edges
    const edgeData = [
      // Invitation edges (person → person)
      { from: '00000000-0000-4000-8000-000000000001', to: '00000000-0000-4000-8000-000000000002', relation: 'invited' }, // Kurt → Alice
      { from: '00000000-0000-4000-8000-000000000001', to: '00000000-0000-4000-8000-000000000004', relation: 'invited' }, // Kurt → Dave
      { from: '00000000-0000-4000-8000-000000000001', to: '00000000-0000-4000-8000-000000000006', relation: 'invited' }, // Kurt → Eddie
      { from: '00000000-0000-4000-8000-000000000002', to: '00000000-0000-4000-8000-000000000003', relation: 'invited' }, // Alice → Bob
      { from: '00000000-0000-4000-8000-000000000004', to: '00000000-0000-4000-8000-000000000005', relation: 'invited' }, // Dave → Carol
      { from: '00000000-0000-4000-8000-000000000006', to: '00000000-0000-4000-8000-000000000009', relation: 'invited' }, // Eddie → Freddy
      { from: '00000000-0000-4000-8000-000000000009', to: '00000000-0000-4000-8000-00000000000a', relation: 'invited' }, // Freddy → Garry
      { from: '00000000-0000-4000-8000-00000000000a', to: '00000000-0000-4000-8000-00000000000b', relation: 'invited' }, // Garry → Harry

      // Resource creation (person → url/mcp)
      { from: '00000000-0000-4000-8000-000000000003', to: '00000000-0000-4000-8000-000000000007', relation: 'created' }, // Bob → Bob's Website
      { from: '00000000-0000-4000-8000-000000000003', to: '00000000-0000-4000-8000-000000000007', relation: 'collaborates_on' }, // Bob collaborates on his website
      { from: '00000000-0000-4000-8000-000000000001', to: '00000000-0000-4000-8000-000000000008', relation: 'created' }, // Kurt → be-part-of.net
      { from: '00000000-0000-4000-8000-000000000001', to: '00000000-0000-4000-8000-000000000008', relation: 'collaborates_on' }, // Kurt collaborates on be-part-of.net

      // Weak connection (person → person)
      { from: '00000000-0000-4000-8000-000000000003', to: '00000000-0000-4000-8000-000000000005', relation: 'knowing' }, // Bob → Carol
    ];

    const { error: edgesError } = await adminClient.from('edges').insert(
      edgeData.map((e) => ({
        from_node_id: e.from,
        to_node_id: e.to,
        relation: e.relation,
        created_by: null,
      }))
    );

    if (edgesError) {
      console.error('Edges insert error:', edgesError);
      return NextResponse.json(
        { error: `Failed to create edges: ${edgesError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Test data created successfully',
      stats: {
        nodes: 11, // Kurt + 7 persons + 2 URLs
        edges: 13, // 8 invitations + 2 created + 2 collaborates_on + 1 knowing
      },
    });
  } catch (error: any) {
    console.error('Reset error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to reset data' },
      { status: 500 }
    );
  }
}
