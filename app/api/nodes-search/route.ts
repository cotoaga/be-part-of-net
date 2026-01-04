import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { searchNodesSchema } from '@/lib/api/validation';
import { errorResponse } from '@/lib/api/errors';

/**
 * GET /api/nodes-search
 * Search nodes by name, URL, or filter by type
 *
 * Query parameters:
 * - q: Search query (searches name, description, url)
 * - url: Exact URL match (for duplicate checking)
 * - type: Comma-separated types to filter (e.g., "url,mcp")
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Parse and validate query parameters
    const searchParams = request.nextUrl.searchParams;
    const queryParams = {
      q: searchParams.get('q') || undefined,
      url: searchParams.get('url') || undefined,
      type: searchParams.get('type') || undefined,
    };

    const validated = searchNodesSchema.parse(queryParams);

    // Start building query
    let query = supabase.from('nodes').select('*');

    // Exact URL match (for duplicate checking)
    if (validated.url) {
      query = query.eq('url', validated.url);
    }
    // Text search (ILIKE on name, description, url)
    else if (validated.q) {
      const searchTerm = `%${validated.q}%`;
      query = query.or(
        `name.ilike.${searchTerm},description.ilike.${searchTerm},url.ilike.${searchTerm}`
      );
    }

    // Filter by type(s)
    if (validated.type) {
      const types = validated.type.split(',').map((t) => t.trim());
      if (types.length === 1) {
        query = query.eq('type', types[0]);
      } else {
        query = query.in('type', types);
      }
    }

    // Order and limit
    query = query.order('created_at', { ascending: false }).limit(20);

    // Execute query
    const { data: nodes, error } = await query;

    if (error) {
      console.error('Failed to search nodes:', error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      nodes: nodes || [],
      count: nodes?.length || 0,
      query: {
        q: validated.q,
        url: validated.url,
        type: validated.type,
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
