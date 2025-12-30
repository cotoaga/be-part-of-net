# CLAUDE.md

AI Assistant Context Document for be-part-of.net

## Project Overview

**be-part-of.net** is "the anti-social social network" - a consciousness network platform that visualizes human and AI relationships as an interactive 3D graph.

**Current Status:** Fresh rebuild completed (December 2025). The project has been simplified to a minimal viable product with a clean slate architecture.

**Production URL:** https://be-part-of-net.vercel.app

## Tech Stack

- **Framework:** Next.js 14.2 (App Router)
- **Runtime:** Node.js 22
- **Language:** TypeScript 5.6
- **UI Library:** React 18.3
- **3D Visualization:** React Three Fiber 8.18 + @react-three/drei 9.122 + Three.js 0.180
- **Styling:** Tailwind CSS 3.4 with light/dark mode
- **Backend/Auth:** Supabase (@supabase/ssr 0.5.1, @supabase/supabase-js 2.45.4)
- **State Management:** React useState (no complex state management)
- **Data Fetching:** Native fetch in useEffect
- **Deployment:** Vercel
- **Package Manager:** npm

## Project Structure

```
be-part-of-net/
├── archive/                        # Previous version (archived, not deleted)
├── app/
│   ├── api/
│   │   ├── auth/callback/          # Supabase auth callback
│   │   └── reset/                  # Network reset endpoint
│   ├── page.tsx                    # Login page
│   ├── network/                    # User network dashboard
│   ├── layout.tsx                  # Root layout
│   └── globals.css                 # Global styles
├── components/
│   ├── Auth/LoginForm.tsx          # Email/password login form
│   ├── NetworkView.tsx             # Network dashboard with controls
│   ├── Graph/
│   │   ├── GraphCanvas.tsx         # 3D canvas with camera control
│   │   ├── Node3D.tsx              # 3D node spheres
│   │   ├── Edge3D.tsx              # 3D edge lines with arrows
│   └── ui/
│       └── ThemeToggle.tsx         # Light/dark mode toggle
├── lib/
│   ├── fogOfWar.ts                 # Visibility calculations (hop-distance)
│   ├── hooks/useForceSimulation.ts # Physics simulation
│   ├── supabase/
│   │   ├── client.ts               # Client-side Supabase
│   │   └── server.ts               # Server-side Supabase
├── types/
│   └── index.ts                    # Type definitions
├── supabase/
│   └── migrations/
│       └── 100_fresh_start_schema.sql  # Simple nodes/edges schema
├── middleware.ts                   # Auth protection
└── .nvmrc                          # Node.js 22
```

## Application Routes

| Route | Auth | Purpose |
|-------|------|---------|
| `/` | Public | Login page with pre-populated test credentials |
| `/network` | Protected | User's network dashboard with 3D graph |
| `/api/auth/callback` | Public | Supabase auth callback |
| `/api/reset` | Protected | Reset network to test data |

### `/` - Login Page
- Email/password form with pre-populated credentials (kurt@cotoaga.net / !mp3riuMalphA)
- Sign In / Sign Up toggle
- Light/dark theme toggle
- Redirects to `/network` after auth

### `/network` - Network Dashboard
- Welcome header with user name
- 3D force-directed graph visualization
- Control bar:
  - Reset Network button (populates test data)
  - Recenter View button (resets camera to centered node)
  - Node/edge count display
- Theme toggle
- Sign Out button

## Key Components

### GraphCanvas.tsx
- Main 3D canvas using React Three Fiber + Three.js
- **Camera Control:**
  - Smooth animation to centered node on selection
  - No snap-back during user interaction
  - Recenter button triggers camera animation
  - OrbitControls for manual pan/rotate/zoom
- **Rendering:**
  - Fog-of-war visibility (3-hop distance)
  - Force-directed physics simulation
  - Type-based node colors
  - Directional edges with arrow heads

### Node3D.tsx
- 3D sphere meshes with @react-three/drei
- **Node types:** person (blue), url (orange), mcp (purple)
- **Root node distinction:** Golden color for network origin (invited_by = null)
- **Golden ring:** Flat ring around root node (scales with node on hover)
- **Hover effects:** 1.2x scale animation on entire group (node + ring)
- **Size:** Based on connection count (min 0.3, max 1.0)
- **Pointer events:** stopPropagation on both over and out handlers

### Edge3D.tsx
- Directional edges using Line component from @react-three/drei
- Arrow head (cone) at midpoint showing direction (from → to)
- Emerald green color (#10B981)
- 60% opacity

### useForceSimulation.ts
- Physics engine using requestAnimationFrame
- **Forces:**
  - Coulomb repulsion (nodes push apart)
  - Hooke spring attraction (connected nodes pull together)
  - Centering force (prevents drift)
- Updates node x/y/z positions in-place
- Pause/resume capability (currently not exposed in UI)

### fogOfWar.ts
- BFS-based visibility calculation from centered node
- **Hop distances:**
  - 0-1: Full opacity (1.0)
  - 2: 70% opacity (0.7)
  - 3: 40% opacity (0.4)
  - 4+: Hidden (0.0)
- Returns Map<nodeId, {opacity, distance}>

## Database Schema

### Simple Schema (Current)

The fresh rebuild uses a minimal two-table schema:

#### nodes
```sql
CREATE TABLE nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('person', 'url', 'mcp')),
  name TEXT NOT NULL,
  description TEXT,
  email TEXT,                      -- Person only
  url TEXT,                        -- URL/MCP only
  invited_by UUID REFERENCES nodes(id) ON DELETE SET NULL,  -- Person only, NULL = root
  created_by UUID REFERENCES nodes(id) ON DELETE SET NULL,  -- Who added this node
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Node types:**
- `person`: Human users (blue spheres)
- `url`: Web resources (orange spheres)
- `mcp`: MCP servers for AI agents (purple spheres)

**Root node:** `invited_by = NULL` marks the network origin (displayed as golden)

#### edges
```sql
CREATE TABLE edges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_node_id UUID NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
  to_node_id UUID NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
  relation TEXT NOT NULL CHECK (relation IN ('invited', 'knowing', 'working_with', 'created', 'using')),
  created_by UUID REFERENCES nodes(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(from_node_id, to_node_id, relation)
);
```

**Relations:**
- `invited`: Person invited another person
- `knowing`: Person knows person
- `working_with`: Person works with person
- `created`: Person created URL/MCP
- `using`: Person uses URL/MCP

### Indexes
```sql
CREATE INDEX idx_nodes_type ON nodes(type);
CREATE INDEX idx_nodes_invited_by ON nodes(invited_by);
CREATE INDEX idx_nodes_created_by ON nodes(created_by);
CREATE INDEX idx_edges_from ON edges(from_node_id);
CREATE INDEX idx_edges_to ON edges(to_node_id);
CREATE INDEX idx_edges_relation ON edges(relation);
```

### Row Level Security (RLS)

**Policies:**
- Anyone can SELECT (read) nodes and edges
- Authenticated users can INSERT nodes and edges
- Users can UPDATE/DELETE nodes they created (created_by match)
- Users can UPDATE/DELETE edges they created (created_by match)
- Special rule: Can't DELETE person nodes (only created_by can delete url/mcp)
- Special rule: Can't DELETE edges with relation='invited'

### Helper Functions

```sql
-- BFS for fog-of-war visibility (hop distance calculation)
get_hop_distance(source_node_id UUID) RETURNS TABLE (node_id UUID, hop_distance INT)

-- Auto-update timestamp trigger
update_updated_at_column()
```

## Authentication Flow

1. **New user visits `/`** → sees login page
2. **Sign in with kurt@cotoaga.net / !mp3riuMalphA** → redirect to `/network`
3. **User sees their node** (if they have one) or root node as center
4. **Middleware protects** `/network` route (redirects to `/` if not authenticated)

**Note:** No auto-node creation on signup in current version. Nodes must be created via reset endpoint or manual insert.

## Test Data

### Reset Endpoint (`POST /api/reset`)
Creates a small test network:

**Nodes (7 total):**
1. Kurt (person, root) - kurt@cotoaga.net
2. Alice (person, invited by Kurt)
3. Bob (person, invited by Alice)
4. Dave (person, invited by Kurt)
5. Carol (person, invited by Dave)
6. Eddie (person, invited by Kurt)
7. Bob's Website (url, created by Bob)

**Edges (7 total):**
- Kurt → Alice (invited)
- Kurt → Dave (invited)
- Kurt → Eddie (invited)
- Alice → Bob (invited)
- Dave → Carol (invited)
- Bob → Bob's Website (created)
- Bob → Carol (knowing)

## Design System

### COTOAGA.AI Aesthetic

**Color Palette:**
```css
/* Light Mode */
--color-primary: #00A86B;          /* Klein Bottle Green */
--color-background: #FAFAFA;       /* Warm Canvas */
--color-node-person: #3B82F6;      /* Blue */
--color-node-url: #F97316;         /* Orange */
--color-node-mcp: #8B5CF6;         /* Purple */
--color-node-root: #FFD700;        /* Gold */

/* Dark Mode */
--color-primary: #0088FF;          /* Deep Space Blue */
--color-background: #0A0A0A;       /* Midnight Void */
```

**Typography:**
- Body: Inter (sans-serif)
- Display: Space Grotesk
- Monospace: JetBrains Mono

**Theme:**
- Toggle between light/dark mode
- Persists to localStorage (`cotoaga-theme`)
- Applies `dark` class to document element
- All routes use same aesthetic (no terminal routes in fresh rebuild)

## Recent Changes (December 2025)

### Fresh Rebuild Completed
- ✅ Archived old codebase to `/archive` folder
- ✅ Upgraded to Node.js 22
- ✅ Fresh database schema (nodes/edges only)
- ✅ Simplified authentication (email/password)
- ✅ 3D graph with React Three Fiber
- ✅ Fog-of-war visibility system
- ✅ Force-directed physics simulation

### Graph UX Improvements
- ✅ **Camera animation:** Smooth transition to centered node (only on node selection, no snap-back)
- ✅ **Hover fixes:** Added stopPropagation to prevent event conflicts
- ✅ **Golden ring fix:** Moved scale to group level so ring scales with node on hover
- ✅ **Recenter button:** Triggers camera animation back to centered node
- ✅ **OrbitControls:** User can freely pan/rotate/zoom without interference

## Current State: What's Built

### ✅ Fully Implemented
- Supabase email/password authentication
- Middleware-based route protection
- Light/dark theme toggle
- 3D force-directed graph visualization
- Fog-of-war visibility (3-hop distance)
- Type-based node coloring (person/url/mcp)
- Root node distinction (golden color + ring)
- Node sizing based on connection count
- Directional edges with arrow heads
- Interactive camera controls (click to focus, orbit, zoom, recenter)
- Physics simulation (spring + repulsion forces)
- Test data reset endpoint
- Hover effects with proper scaling

### ❌ Not Yet Implemented
- Auto-node creation on signup
- User profile editing
- Node creation UI (must use reset endpoint)
- Edge creation UI (must use reset endpoint)
- Node deletion UI
- Search/filter nodes
- Real-time updates (Supabase subscriptions)
- Network statistics (connection count, depth, etc.)
- Invitation system
- Admin controls
- Mobile optimization
- Loading states
- Error boundaries

## Known Issues & Technical Debt

### Minor Issues
1. **No user node association:** Logged-in user doesn't have an associated node (no auto-creation trigger)
2. **Hard-coded test credentials:** Pre-populated in login form for development
3. **Client-side data fetching:** NetworkView uses useEffect instead of server components
4. **No loading states:** Graph appears suddenly when data loads
5. **Random initial positions:** Nodes start at random positions every render (should persist)

### Future Improvements
- Add user node association (link auth.users to nodes table)
- Server-side data fetching with React Server Components
- Skeleton loaders for graph
- Persist node positions in database or localStorage
- Add error boundaries around 3D canvas
- Optimize for mobile (touch controls, smaller viewport)
- Add real-time subscriptions for collaborative editing

## Environment Variables

Required in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Development

### Scripts
```bash
npm run dev                      # Start dev server
npm run build                    # Production build
npm run start                    # Start production server
npm run lint                     # ESLint check
npm run type-check               # TypeScript check
```

### Build Process
- Type-check before build
- Lint before build
- Vercel deployment on push to main

## Deployment

- **Platform:** Vercel
- **Region:** US East (iad1)
- **Auto-deploy:** Push to main branch
- **Environment:** Production variables configured in Vercel dashboard

---

**Last Updated:** 2025-12-30
**Version:** 0.1.0 (Fresh Rebuild)
**Maintained by:** kydroon

**Recent Commits:**
- `eb763c36` - feat(graph): add recenter view button
- `ecaa6c52` - fix(graph): fix hover issues and golden ring displacement
- `a797276e` - fix(graph): remove camera snap-back, only animate on node selection
- `511eb441` - fix(api): mark /api/me/node as dynamic route (cleanup old routes)
