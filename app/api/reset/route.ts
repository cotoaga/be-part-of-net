import { createClient } from '@/lib/supabase/server';
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

    // Delete all existing nodes and edges (cascade will handle edges)
    const { error: deleteError } = await supabase.from('nodes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (deleteError) {
      console.error('Delete error:', deleteError);
      return NextResponse.json({ error: `Delete failed: ${deleteError.message}` }, { status: 500 });
    }

    // Insert Kurt (ROOT - no invited_by)
    const { data: kurt, error: kurtError } = await supabase
      .from('nodes')
      .insert({
        id: '00000000-0000-0000-0000-000000000001',
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
      return NextResponse.json({ error: `Failed to create Kurt: ${kurtError.message}` }, { status: 500 });
    }

    // Insert other persons
    const persons = [
      { id: '00000000-0000-0000-0000-000000000002', name: 'Alice', email: 'alice@example.com', invited_by: kurt?.id },
      { id: '00000000-0000-0000-0000-000000000003', name: 'Bob', email: 'bob@example.com', invited_by: '00000000-0000-0000-0000-000000000002' },
      { id: '00000000-0000-0000-0000-000000000004', name: 'Dave', email: 'dave@example.com', invited_by: kurt?.id },
      { id: '00000000-0000-0000-0000-000000000005', name: 'Carol', email: 'carol@example.com', invited_by: '00000000-0000-0000-0000-000000000004' },
      { id: '00000000-0000-0000-0000-000000000006', name: 'Eddie', email: 'eddie@example.com', invited_by: kurt?.id },
    ];

    await supabase.from('nodes').insert(
      persons.map((p) => ({
        ...p,
        type: 'person',
        description: `Test node: ${p.name}`,
        created_by: null,
      }))
    );

    // Insert Bob's Website (URL)
    await supabase.from('nodes').insert({
      id: '00000000-0000-0000-0000-000000000007',
      type: 'url',
      name: "Bob's Website",
      url: 'https://bob.example.com',
      description: "Bob's personal website",
      created_by: '00000000-0000-0000-0000-000000000003',
    });

    // Insert edges
    const edgeData = [
      { from: '00000000-0000-0000-0000-000000000001', to: '00000000-0000-0000-0000-000000000002', relation: 'invited' },
      { from: '00000000-0000-0000-0000-000000000001', to: '00000000-0000-0000-0000-000000000004', relation: 'invited' },
      { from: '00000000-0000-0000-0000-000000000001', to: '00000000-0000-0000-0000-000000000006', relation: 'invited' },
      { from: '00000000-0000-0000-0000-000000000002', to: '00000000-0000-0000-0000-000000000003', relation: 'invited' },
      { from: '00000000-0000-0000-0000-000000000004', to: '00000000-0000-0000-0000-000000000005', relation: 'invited' },
      { from: '00000000-0000-0000-0000-000000000003', to: '00000000-0000-0000-0000-000000000007', relation: 'created' },
      { from: '00000000-0000-0000-0000-000000000003', to: '00000000-0000-0000-0000-000000000005', relation: 'knowing' },
    ];

    await supabase.from('edges').insert(
      edgeData.map((e) => ({
        from_node_id: e.from,
        to_node_id: e.to,
        relation: e.relation,
        created_by: null,
      }))
    );

    return NextResponse.json({
      success: true,
      message: 'Test data created successfully',
      stats: {
        nodes: 7,
        edges: 7,
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
