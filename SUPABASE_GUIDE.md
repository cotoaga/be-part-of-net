# How to Use Supabase in be-part-of.net

A comprehensive guide for Claude instances working on the be-part-of.net codebase.

## Table of Contents

1. [Overview](#overview)
2. [Three Types of Supabase Clients](#three-types-of-supabase-clients)
3. [Authentication Patterns](#authentication-patterns)
4. [Database Queries](#database-queries)
5. [Row Level Security (RLS)](#row-level-security-rls)
6. [Common Patterns](#common-patterns)
7. [Best Practices](#best-practices)
8. [Real Examples](#real-examples)

---

## Overview

be-part-of.net uses **Supabase** for:
- **Authentication** - Email/password sign-in
- **Database** - PostgreSQL with two simple tables (`nodes`, `edges`)
- **Row Level Security (RLS)** - Fine-grained access control

**Key Environment Variables:**
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # Server-only, bypasses RLS
```

---

## Three Types of Supabase Clients

### 1. Browser Client (Client Components)

**Location:** `/lib/supabase/client.ts`

```typescript
import { createClient } from '@/lib/supabase/client';

// In a client component
const supabase = createClient();
```

**When to use:**
- ✅ Client components (`'use client'`)
- ✅ User authentication (sign in, sign out, get user)
- ✅ Client-side data fetching
- ✅ Real-time subscriptions (not yet implemented in project)

**What it does:**
- Uses `@supabase/ssr` with `createBrowserClient`
- Respects RLS policies based on authenticated user
- Manages session cookies automatically
- Can only access data allowed by RLS policies

**Example:**
```typescript
'use client';

import { createClient } from '@/lib/supabase/client';

export default function MyComponent() {
  const handleSignIn = async () => {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: 'user@example.com',
      password: 'password123',
    });

    if (error) console.error(error);
  };

  return <button onClick={handleSignIn}>Sign In</button>;
}
```

---

### 2. Server Client (Server Components & API Routes)

**Location:** `/lib/supabase/server.ts`

```typescript
import { createClient } from '@/lib/supabase/server';

// In a server component or API route
const supabase = await createClient();
```

**When to use:**
- ✅ Server components
- ✅ API route handlers (`app/api/**/route.ts`)
- ✅ Server actions (if used)
- ✅ Middleware

**What it does:**
- Uses `@supabase/ssr` with `createServerClient`
- Reads session from cookies
- Respects RLS policies based on authenticated user
- Can read/write cookies for session management
- IMPORTANT: Must be awaited because it calls `cookies()` from Next.js

**Example:**
```typescript
// app/api/nodes/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const supabase = await createClient();  // Must await!

  const { data, error } = await supabase
    .from('nodes')
    .select('*');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ nodes: data });
}
```

---

### 3. Admin Client (Bypass RLS)

**Location:** `/lib/supabase/admin.ts`

```typescript
import { createAdminClient } from '@/lib/supabase/admin';

// In server-side code only
const supabase = createAdminClient();
```

**When to use:**
- ⚠️ **Use sparingly!** Only for trusted operations
- ✅ System operations that need to bypass RLS
- ✅ Seeding/resetting database (see `/api/reset/route.ts`)
- ✅ Admin-only endpoints (`/node-zero`, `/api/test/*`)
- ❌ NEVER in client components
- ❌ NEVER for normal user operations

**What it does:**
- Uses service role key (SUPABASE_SERVICE_ROLE_KEY)
- **Bypasses all RLS policies** - has full database access
- No session/cookie management
- Should only run server-side

**Example:**
```typescript
// app/api/reset/route.ts
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  const supabase = createAdminClient();  // Bypasses RLS

  // Delete all data (bypasses RLS delete policies)
  await supabase.from('edges').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('nodes').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  // Insert test data
  const { data: nodes } = await supabase
    .from('nodes')
    .insert([...])
    .select();

  return NextResponse.json({ success: true });
}
```

---

## Authentication Patterns

### 1. Sign In (Client-Side)

```typescript
// components/Auth/LoginForm.tsx
const supabase = createClient();

const { error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password',
});

if (!error) {
  router.push('/network');
  router.refresh();
}
```

### 2. Get Current User (Server-Side)

```typescript
// API route
import { createClient } from '@/lib/supabase/server';

const supabase = await createClient();
const { data: { user }, error } = await supabase.auth.getUser();

if (!user) {
  return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
}
```

### 3. Require Authentication (Helper Function)

```typescript
// lib/api/auth.ts
import { requireAuth } from '@/lib/api/auth';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const user = await requireAuth(supabase);  // Throws if not authenticated

  // User is guaranteed to exist here
  console.log(user.email);
}
```

### 4. Middleware Authentication Check

```typescript
// middleware.ts
const supabase = createServerClient(...);
const { data: { user } } = await supabase.auth.getUser();

if (!user) {
  // Redirect to login
  const url = request.nextUrl.clone();
  url.pathname = '/login';
  return NextResponse.redirect(url);
}
```

### 5. Sign Out (Client-Side)

```typescript
const supabase = createClient();
await supabase.auth.signOut();
router.push('/');
router.refresh();
```

---

## Database Queries

### Schema Overview

**Tables:**
- `nodes` - Person, URL, or MCP nodes
- `edges` - Relations between nodes

**Node Types:**
- `person` - Human users (has `email` field)
- `url` - Web resources (has `url` field)
- `mcp` - MCP servers for AI agents (has `url` field)

**Edge Relations (in order of permanence):**
- `invited` - Person invited another person (PERMANENT)
- `created` - Person created URL/MCP (PERMANENT)
- `collaborates_on` - Person actively works on URL/MCP (deletable)
- `knowing` - Person knows another person (deletable)

### Basic SELECT Queries

```typescript
// Get all nodes
const { data, error } = await supabase
  .from('nodes')
  .select('*');

// Get all edges
const { data, error } = await supabase
  .from('edges')
  .select('*');

// Get specific node by ID
const { data, error } = await supabase
  .from('nodes')
  .select('*')
  .eq('id', nodeId)
  .single();  // Returns single object instead of array

// Safe single (doesn't throw if not found)
const { data, error } = await supabase
  .from('nodes')
  .select('*')
  .eq('id', nodeId)
  .maybeSingle();  // Returns null if not found

// Filter by type
const { data } = await supabase
  .from('nodes')
  .select('*')
  .eq('type', 'person');

// Multiple conditions
const { data } = await supabase
  .from('nodes')
  .select('*')
  .eq('type', 'person')
  .not('invited_by', 'is', null);  // Not root nodes

// Order results
const { data } = await supabase
  .from('nodes')
  .select('*')
  .order('created_at', { ascending: false });
```

### INSERT Queries

```typescript
// Insert single node
const { data, error } = await supabase
  .from('nodes')
  .insert({
    type: 'person',
    name: 'Alice',
    email: 'alice@example.com',
    invited_by: inviterNodeId,
    created_by: creatorNodeId,
  })
  .select()  // Return the inserted row
  .single();

// Insert multiple nodes
const { data, error } = await supabase
  .from('nodes')
  .insert([
    { type: 'person', name: 'Alice', ... },
    { type: 'person', name: 'Bob', ... },
  ])
  .select();

// Insert edge
const { data, error } = await supabase
  .from('edges')
  .insert({
    from_node_id: fromNodeId,
    to_node_id: toNodeId,
    relation: 'invited',
    created_by: creatorNodeId,
  })
  .select()
  .single();
```

### UPDATE Queries

```typescript
// Update node
const { data, error } = await supabase
  .from('nodes')
  .update({
    name: 'New Name',
    description: 'Updated description',
    updated_at: new Date().toISOString(),
  })
  .eq('id', nodeId)
  .select()
  .single();

// Note: RLS ensures only creator can update (created_by = auth.uid())
```

### DELETE Queries

```typescript
// Delete node (only url/mcp, not person)
const { error } = await supabase
  .from('nodes')
  .delete()
  .eq('id', nodeId);

// Delete edge (not invited/created)
const { error } = await supabase
  .from('edges')
  .delete()
  .eq('id', edgeId);

// Note: RLS enforces:
// - Can't delete person nodes
// - Can't delete invited/created edges
// - Can only delete resources you created
```

### Check for Duplicates

```typescript
// Check if email exists (before creating person)
const { data: existing } = await supabase
  .from('nodes')
  .select('id')
  .eq('type', 'person')
  .eq('email', email)
  .maybeSingle();

if (existing) {
  return NextResponse.json(
    { error: 'Email already exists', existingNodeId: existing.id },
    { status: 409 }
  );
}

// Check if edge exists
const { data: existingEdge } = await supabase
  .from('edges')
  .select('id')
  .eq('from_node_id', fromNodeId)
  .eq('to_node_id', toNodeId)
  .eq('relation', relation)
  .maybeSingle();
```

### Fetch Related Data

```typescript
// Get node with all outgoing edges
const { data } = await supabase
  .from('nodes')
  .select(`
    *,
    outgoing_edges:edges!from_node_id(*)
  `)
  .eq('id', nodeId)
  .single();

// Get all nodes + edges in parallel (recommended for graph)
const [nodesRes, edgesRes] = await Promise.all([
  supabase.from('nodes').select('*'),
  supabase.from('edges').select('*'),
]);
```

---

## Row Level Security (RLS)

### RLS Policies Overview

**Be-part-of.net uses RLS to:**
- Allow anyone to read all data (fog-of-war is client-side)
- Require authentication for writes
- Ensure users can only modify resources they created
- Prevent deletion of permanent data (person nodes, invited/created edges)

### Nodes Table Policies

```sql
-- Anyone can view all nodes
CREATE POLICY "Anyone can view nodes"
  ON nodes FOR SELECT
  USING (true);

-- Authenticated users can create nodes
CREATE POLICY "Authenticated users can create nodes"
  ON nodes FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Users can update only nodes they created
CREATE POLICY "Users can update nodes they created"
  ON nodes FOR UPDATE
  USING (created_by = auth.uid()::uuid);

-- Users can delete only url/mcp nodes they created (not person)
CREATE POLICY "Users can delete nodes they created"
  ON nodes FOR DELETE
  USING (created_by = auth.uid()::uuid AND type IN ('url', 'mcp'));
```

### Edges Table Policies

```sql
-- Anyone can view all edges
CREATE POLICY "Anyone can view edges"
  ON edges FOR SELECT
  USING (true);

-- Authenticated users can create edges
CREATE POLICY "Authenticated users can create edges"
  ON edges FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Users can update edges they created
CREATE POLICY "Users can update edges they created"
  ON edges FOR UPDATE
  USING (created_by = auth.uid()::uuid);

-- Users can delete edges they created (except invited/created)
CREATE POLICY "Users can delete edges they created"
  ON edges FOR DELETE
  USING (created_by = auth.uid()::uuid AND relation != 'invited');
```

### Understanding `created_by` Field

**Two possible values:**
1. **Node ID** (UUID of user's person node) - preferred
2. **Auth ID** (auth.uid() from Supabase Auth) - fallback

**Why both?**
- Not all authenticated users have a person node
- Use node ID if it exists (for graph provenance)
- Fall back to auth ID if user doesn't have a node

**Helper function:**
```typescript
// lib/api/auth.ts
export async function getCreatorId(supabase: SupabaseClient, user: User): Promise<string> {
  // Try to find user's person node
  const nodeId = await getUserNodeId(supabase, user.email!);

  // Use node ID if exists, otherwise auth ID
  return nodeId || user.id;
}
```

### RLS in Practice

**When using regular client (browser or server):**
```typescript
const supabase = await createClient();

// This works - anyone can read
const { data } = await supabase.from('nodes').select('*');

// This works if authenticated
await supabase.from('nodes').insert({ ... });

// This works only if you created the node
await supabase.from('nodes').update({ ... }).eq('id', nodeId);

// This fails if:
// - Node is a person (RLS: type IN ('url', 'mcp'))
// - You didn't create it (RLS: created_by = auth.uid())
await supabase.from('nodes').delete().eq('id', nodeId);
```

**When using admin client:**
```typescript
const supabase = createAdminClient();

// RLS is BYPASSED - can do anything!
await supabase.from('nodes').delete().eq('id', nodeId);  // Works even for person nodes
```

---

## Common Patterns

### Pattern 1: API Route with Auth Check

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/api/auth';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const user = await requireAuth(supabase);  // Throws if not authenticated

    const body = await request.json();

    // Your logic here
    const { data, error } = await supabase
      .from('nodes')
      .insert({ ... });

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}
```

### Pattern 2: Client-Side Data Fetching

```typescript
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Node, Edge } from '@/types';

export default function NetworkView() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const supabase = createClient();

        const [nodesRes, edgesRes] = await Promise.all([
          supabase.from('nodes').select('*').order('created_at'),
          supabase.from('edges').select('*'),
        ]);

        if (nodesRes.data) setNodes(nodesRes.data);
        if (edgesRes.data) setEdges(edgesRes.data);
      } catch (error) {
        console.error('Failed to fetch:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return loading ? <div>Loading...</div> : <Graph nodes={nodes} edges={edges} />;
}
```

### Pattern 3: Create Node + Edge in Transaction

```typescript
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const user = await requireAuth(supabase);
  const creatorId = await getCreatorId(supabase, user);

  const body = await request.json();

  // Create node first
  const { data: node, error: nodeError } = await supabase
    .from('nodes')
    .insert({
      type: body.type,
      name: body.name,
      created_by: creatorId,
    })
    .select()
    .single();

  if (nodeError) throw nodeError;

  // Create edges (dual-edge pattern for resources)
  if (body.type !== 'person') {
    await supabase
      .from('edges')
      .insert([
        {
          from_node_id: creatorId,
          to_node_id: node.id,
          relation: 'created',  // Permanent provenance
          created_by: creatorId,
        },
        {
          from_node_id: creatorId,
          to_node_id: node.id,
          relation: 'collaborates_on',  // Active contribution
          created_by: creatorId,
        },
      ]);
  }

  return NextResponse.json({ success: true, node });
}
```

### Pattern 4: Soft Refetch (Preserve Graph State)

```typescript
// lib/refetch.ts
export async function softRefetchGraphData(
  setNodes: (nodes: Node[]) => void,
  setEdges: (edges: Edge[]) => void
) {
  const supabase = createClient();

  const [nodesRes, edgesRes] = await Promise.all([
    supabase.from('nodes').select('*').order('created_at'),
    supabase.from('edges').select('*'),
  ]);

  if (nodesRes.data) setNodes(nodesRes.data);
  if (edgesRes.data) setEdges(edgesRes.data);
}
```

### Pattern 5: Check Ownership Before Delete

```typescript
import { canDeleteNode } from '@/lib/api/auth';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();
  const user = await requireAuth(supabase);

  // Check if user has permission (throws if not)
  await canDeleteNode(supabase, params.id, user);

  // RLS will also enforce, but explicit check gives better error messages
  const { error } = await supabase
    .from('nodes')
    .delete()
    .eq('id', params.id);

  if (error) throw error;

  return NextResponse.json({ success: true });
}
```

---

## Best Practices

### 1. Always Use the Right Client

❌ **Don't:**
```typescript
// In a client component
import { createClient } from '@/lib/supabase/server';  // Wrong!
```

✅ **Do:**
```typescript
// In a client component
import { createClient } from '@/lib/supabase/client';

// In API routes
import { createClient } from '@/lib/supabase/server';

// For admin operations (server-side only)
import { createAdminClient } from '@/lib/supabase/admin';
```

### 2. Handle Errors Properly

❌ **Don't:**
```typescript
const { data } = await supabase.from('nodes').select('*');
// No error handling!
```

✅ **Do:**
```typescript
const { data, error } = await supabase.from('nodes').select('*');

if (error) {
  console.error('Database error:', error);
  return NextResponse.json({ error: error.message }, { status: 500 });
}
```

### 3. Use `.single()` vs `.maybeSingle()`

❌ **Don't:**
```typescript
// Throws error if no rows found
const { data } = await supabase
  .from('nodes')
  .select('*')
  .eq('id', nodeId)
  .single();  // Throws if not found
```

✅ **Do:**
```typescript
// Returns null if no rows found (safer)
const { data } = await supabase
  .from('nodes')
  .select('*')
  .eq('id', nodeId)
  .maybeSingle();  // Returns null if not found

if (!data) {
  return NextResponse.json({ error: 'Node not found' }, { status: 404 });
}
```

### 4. Always Check for Duplicates

✅ **Do:**
```typescript
// Before creating a person
const { data: existing } = await supabase
  .from('nodes')
  .select('id')
  .eq('type', 'person')
  .eq('email', email)
  .maybeSingle();

if (existing) {
  return NextResponse.json(
    { error: 'Email already exists', existingNodeId: existing.id },
    { status: 409 }
  );
}
```

### 5. Use Helper Functions

✅ **Do:**
```typescript
import { requireAuth, getCreatorId } from '@/lib/api/auth';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const user = await requireAuth(supabase);  // Handles auth check
  const creatorId = await getCreatorId(supabase, user);  // Handles creator logic

  // Your logic here
}
```

### 6. Parallel Queries When Possible

❌ **Don't:**
```typescript
const nodes = await supabase.from('nodes').select('*');
const edges = await supabase.from('edges').select('*');
// Sequential - slow!
```

✅ **Do:**
```typescript
const [nodesRes, edgesRes] = await Promise.all([
  supabase.from('nodes').select('*'),
  supabase.from('edges').select('*'),
]);
// Parallel - fast!
```

### 7. Never Hardcode Auth IDs

❌ **Don't:**
```typescript
const creatorId = '12345678-1234-1234-1234-123456789012';
```

✅ **Do:**
```typescript
const user = await requireAuth(supabase);
const creatorId = await getCreatorId(supabase, user);
```

### 8. Validate Before Database Calls

✅ **Do:**
```typescript
import { createNodeSchema } from '@/lib/api/validation';

const body = await request.json();
const validated = createNodeSchema.parse(body);  // Zod validation

// Now safe to use validated data
const { data } = await supabase.from('nodes').insert(validated);
```

---

## Real Examples

### Example 1: Create Person Node (Invite)

From `/app/api/nodes/route.ts`:

```typescript
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const user = await requireAuth(supabase);

    const body = await request.json();
    const validated = createNodeSchema.parse(body);

    // Check for duplicate email
    if (validated.type === 'person' && validated.email) {
      const { data: existing } = await supabase
        .from('nodes')
        .select('id')
        .eq('type', 'person')
        .eq('email', validated.email)
        .maybeSingle();

      if (existing) {
        return NextResponse.json(
          { error: 'Email already exists', existingNodeId: existing.id },
          { status: 409 }
        );
      }
    }

    const creatorId = await getCreatorId(supabase, user);

    // Create node
    const { data: node, error } = await supabase
      .from('nodes')
      .insert({
        type: validated.type,
        name: validated.name,
        email: validated.email || null,
        invited_by: validated.invited_by || null,
        created_by: creatorId,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, node }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
```

### Example 2: Create Edge with Validation

From `/app/api/edges/route.ts`:

```typescript
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const user = await requireAuth(supabase);

    const body = await request.json();
    const validated = createEdgeSchema.parse(body);

    // Validate nodes exist and get their types
    const { data: nodes, error: nodesError } = await supabase
      .from('nodes')
      .select('id, type')
      .in('id', [validated.from_node_id, validated.to_node_id]);

    if (nodesError || !nodes || nodes.length !== 2) {
      throw ApiErrors.notFound('One or both nodes not found');
    }

    const fromNode = nodes.find(n => n.id === validated.from_node_id);
    const toNode = nodes.find(n => n.id === validated.to_node_id);

    // Validate relation is compatible with node types
    const isValid = validateRelationTypes(
      validated.relation,
      fromNode.type as NodeType,
      toNode.type as NodeType
    );

    if (!isValid) {
      throw ApiErrors.unprocessable(
        `Relation '${validated.relation}' invalid between ${fromNode.type} and ${toNode.type}`
      );
    }

    // Check for duplicate
    const { data: existingEdge } = await supabase
      .from('edges')
      .select('id')
      .eq('from_node_id', validated.from_node_id)
      .eq('to_node_id', validated.to_node_id)
      .eq('relation', validated.relation)
      .maybeSingle();

    if (existingEdge) {
      return NextResponse.json(
        { error: 'Edge already exists', existingEdgeId: existingEdge.id },
        { status: 409 }
      );
    }

    const creatorId = await getCreatorId(supabase, user);

    // Create edge
    const { data: edge, error } = await supabase
      .from('edges')
      .insert({
        from_node_id: validated.from_node_id,
        to_node_id: validated.to_node_id,
        relation: validated.relation,
        created_by: creatorId,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, edge }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
```

### Example 3: Sign In Flow

From `/components/Auth/LoginForm.tsx`:

```typescript
'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const supabase = createClient();

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      router.push('/network');
      router.refresh();  // Refresh server components
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
    }
  };

  return <form onSubmit={handleLogin}>...</form>;
}
```

### Example 4: Middleware Auth Check

From `/middleware.ts`:

```typescript
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Redirect if not authenticated
  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
```

### Example 5: Reset Database (Admin Client)

From `/app/api/reset/route.ts`:

```typescript
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  const supabase = createAdminClient();  // Bypasses RLS

  // Delete all data (bypasses RLS delete policies)
  await supabase.from('edges').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('nodes').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  // Create test nodes
  const { data: nodes } = await supabase
    .from('nodes')
    .insert([
      { type: 'person', name: 'Kurt', email: 'kurt@cotoaga.net', invited_by: null },
      { type: 'person', name: 'Alice', email: 'alice@example.com', invited_by: nodes[0].id },
      // ...
    ])
    .select();

  // Create test edges
  await supabase
    .from('edges')
    .insert([
      { from_node_id: nodes[0].id, to_node_id: nodes[1].id, relation: 'invited' },
      // ...
    ]);

  return NextResponse.json({ success: true, nodes });
}
```

---

## Quick Reference

| Task | Client Type | Location | Awaited? |
|------|-------------|----------|----------|
| Sign in/out | Browser | `@/lib/supabase/client` | No |
| Client component queries | Browser | `@/lib/supabase/client` | No |
| API route queries | Server | `@/lib/supabase/server` | Yes |
| Middleware auth check | Server | Inline `createServerClient` | N/A |
| Admin operations | Admin | `@/lib/supabase/admin` | No |
| Reset database | Admin | `@/lib/supabase/admin` | No |

**Remember:**
- Browser client: Client components, auth flows
- Server client: API routes, server components
- Admin client: Bypass RLS, admin operations only
- Always validate inputs with Zod
- Always check for duplicates
- Always use helper functions from `/lib/api/auth.ts`
- RLS policies are enforced on regular clients, bypassed on admin client

---

**Last Updated:** 2026-01-20
**For Questions:** Ask about specific patterns or check real examples in `/app/api/` routes
