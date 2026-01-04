import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createNodeSchema } from '@/lib/api/validation';
import { errorResponse } from '@/lib/api/errors';
import { requireAuth, getCreatorId } from '@/lib/api/auth';

/**
 * POST /api/nodes
 * Create a new node (person, url, or mcp)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const user = await requireAuth(supabase);

    // Parse and validate request body
    const body = await request.json();
    const validated = createNodeSchema.parse(body);

    // Check for duplicate email (person nodes)
    if (validated.type === 'person' && validated.email) {
      const { data: existing } = await supabase
        .from('nodes')
        .select('id')
        .eq('type', 'person')
        .eq('email', validated.email)
        .maybeSingle();

      if (existing) {
        return NextResponse.json(
          {
            error: 'A person with this email already exists',
            code: 'DUPLICATE_EMAIL',
            existingNodeId: existing.id,
          },
          { status: 409 }
        );
      }
    }

    // Check for duplicate URL (url/mcp nodes)
    if ((validated.type === 'url' || validated.type === 'mcp') && validated.url) {
      const { data: existing } = await supabase
        .from('nodes')
        .select('id')
        .eq('url', validated.url)
        .maybeSingle();

      if (existing) {
        return NextResponse.json(
          {
            error: 'A node with this URL already exists',
            code: 'DUPLICATE_URL',
            existingNodeId: existing.id,
          },
          { status: 409 }
        );
      }
    }

    // Get creator ID (user's node ID or auth ID)
    const creatorId = await getCreatorId(supabase, user);

    // Create node
    const { data: node, error } = await supabase
      .from('nodes')
      .insert({
        type: validated.type,
        name: validated.name,
        description: validated.description || null,
        email: validated.email || null,
        url: validated.url || null,
        invited_by: validated.invited_by || null,
        created_by: creatorId,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create node:', error);
      throw error;
    }

    return NextResponse.json(
      {
        success: true,
        node,
      },
      { status: 201 }
    );
  } catch (error) {
    return errorResponse(error);
  }
}
