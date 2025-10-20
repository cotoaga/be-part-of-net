# Phase 1 Setup Guide: Demo Mode with Fog-of-War

This guide covers running the database migrations and testing Zaphod's Zoo demo.

## What's Been Built

✅ **Completed in Phase 1:**
- New database schema (users, nodes, edges)
- Fog-of-war visibility system (hop-based opacity)
- Saturn ring animation for centered nodes
- Centered node mechanics with enforced traversal
- Zaphod's Zoo demo data (12 nodes, 18 edges)
- Anonymous demo route at `/`
- Updated GraphVisualization with node type colors

## Prerequisites

1. Supabase project set up
2. Environment variables in `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

## Step 1: Run Database Migrations

### Option A: Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run migrations in order:

**Migration 1: Fresh Start Schema**
```bash
# Copy contents of migrations/001_fresh_start_schema.sql
# Paste into SQL Editor
# Click "Run"
```

**Migration 2: Seed Zaphod's Zoo**
```bash
# Copy contents of migrations/002_seed_zaphodszoo.sql
# Paste into SQL Editor
# Click "Run"
```

### Option B: Supabase CLI

```bash
# Link project (first time only)
supabase link --project-ref your-project-ref

# Run migrations
supabase db push --file migrations/001_fresh_start_schema.sql
supabase db push --file migrations/002_seed_zaphodszoo.sql
```

### Verify Migrations

In Supabase SQL Editor, run:

```sql
-- Check tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('users', 'nodes', 'edges');

-- Check demo nodes
SELECT type, COUNT(*) as count
FROM nodes
WHERE is_demo = TRUE
GROUP BY type;

-- Expected output:
-- type    | count
-- --------+-------
-- app     |     3
-- mcp     |     4
-- person  |     5

-- Check demo edges
SELECT COUNT(*) as edge_count
FROM edges
WHERE is_demo = TRUE;

-- Expected: 18
```

## Step 2: Test the Application

### Start Dev Server

```bash
npm run dev
```

### Test Demo Mode

1. Navigate to http://localhost:3000
2. You should see "Zaphod's Zoo" graph immediately
3. Zaphod Beeblebrox should be centered with Saturn ring animation
4. Click visible nodes to recenter and see fog-of-war

### Expected Behavior

**Fog-of-War Visibility:**
- **Centered node** (Zaphod initially): Full opacity, Saturn ring, large scale
- **Hop 1** (immediate neighbors): Full opacity, names visible
- **Hop 2-3**: Reduced opacity (0.75, 0.5), names visible
- **Hop 4**: Very opaque (0.15), no labels, NOT clickable
- **Hop 5+**: Invisible

**Node Colors by Type:**
- **Person** (blue): Zaphod, Arthur, Ford, Trillian, Marvin
- **App** (orange): Heart of Gold, Infinite Improbability Drive, Babel Fish
- **MCP** (purple): Deep Thought, Guide MCP, Eddie, Milliways

**Interactions:**
- Click any **visible & clickable** node → becomes new center
- Saturn ring animates around centered node
- Fog recalculates from new center
- Cannot click hop 4+ nodes (enforced traversal)

## Step 3: Verify Features

### Checklist

- [ ] Graph loads with 12 nodes visible (from Zaphod's perspective)
- [ ] Saturn ring rotates around Zaphod
- [ ] Clicking Ford Prefect recenters the graph
- [ ] Fog-of-war updates (some nodes become invisible/ghostly)
- [ ] Node colors match types (blue persons, orange apps, purple MCPs)
- [ ] Edges fade with distance (lower opacity)
- [ ] "Sign In" button visible in top-right
- [ ] Stats show NODES: 12, EDGES: 18
- [ ] "CENTERED: [Node Name]" displays current center

## Step 4: Known Limitations (To Be Built)

❌ **Not Yet Implemented:**
- Floating node detail card (view/edit mode)
- Connection creation UI
- User's own network (only demo mode works)
- Node creation/editing
- Edge label privacy (labels visible in demo, will be hidden in real network)
- Real-time updates (must refresh)

## Troubleshooting

### Graph doesn't load
- Check browser console for errors
- Verify migrations ran successfully
- Check Supabase connection in Network tab

### All nodes invisible
- Verify `centeredNodeId` is set (check React DevTools)
- Check `hopDistances` state is populated
- Ensure at least one node has `is_demo=TRUE`

### Saturn ring not visible
- Check if node is actually centered (look for `isCentered={true}` in Node3D)
- Verify SaturnRing component is rendering (React DevTools)

### TypeError: Cannot read property 'x' of undefined
- Usually means simulated nodes haven't loaded yet
- Check loading state in GraphVisualization
- Verify force simulation is running

### Nodes are clickable but nothing happens
- Check `handleNodeClick` function in GraphVisualization
- Verify `setCenteredNodeId` is being called
- Look for console logs: "Node clicked, setting as centered"

## Next Steps (Phase 2+)

After Phase 1 is working:

1. **Design visual system** for non-demo routes
2. **Build floating detail card** component
3. **Implement user authentication** flow
4. **Create user network** (non-demo data fetching)
5. **Add node/edge CRUD** operations
6. **Build invitation system**

## Files Created/Modified

### New Files
- `migrations/001_fresh_start_schema.sql`
- `migrations/002_seed_zaphodszoo.sql`
- `migrations/README.md`
- `types/graph.ts`
- `lib/fogOfWar.ts`
- `components/SaturnRing.tsx`
- `scripts/run-migration.ts` (not used yet, for future automation)

### Modified Files
- `components/GraphVisualization.tsx` - Added fog-of-war logic
- `components/Node3D.tsx` - Added Saturn ring, opacity, node type colors
- `components/Edge3D.tsx` - Added opacity prop
- `components/ForceSimulation.ts` - Added type and confirmed fields
- `app/page.tsx` - Show Zaphod's Zoo automatically

## Questions?

If something isn't working:
1. Check the browser console for errors
2. Verify all migrations ran successfully
3. Check Supabase Dashboard → Table Editor for data
4. Look for console logs in the Network tab (API calls)
5. Use React DevTools to inspect component state

---

**Phase 1 Status:** Complete ✅
**Ready for:** Phase 2 (UI polish, detail cards, user networks)
