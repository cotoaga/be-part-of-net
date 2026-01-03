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
│   │   ├── GraphCanvas.tsx         # 3D canvas with camera state machine
│   │   ├── Node3D.tsx              # High-res 3D spheres with drag support
│   │   ├── Edge3D.tsx              # Real-time edge rendering
│   │   └── DebugOverlay.tsx        # System state visualization
│   └── ui/
│       └── ThemeToggle.tsx         # Light/dark mode toggle
├── lib/
│   ├── fogOfWar.ts                 # Visibility calculations (hop-distance)
│   ├── graphLayout.ts              # Pre-computed stable positions
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
- **Camera State Machine:**
  - INITIALIZING: Camera positioning on first mount
  - ANIMATING: Camera smoothly animating to target (OrbitControls disabled)
  - USER_CONTROL: User freely controls camera (OrbitControls enabled)
- **Camera Control:**
  - Smooth animation to centered node on selection
  - No snap-back during user interaction
  - Recenter button triggers camera animation
  - OrbitControls for manual pan/rotate/zoom (only active in USER_CONTROL state)
- **Rendering:**
  - Pre-computed stable initial positions (no displacement)
  - Fog-of-war visibility (3-hop distance)
  - Force-directed physics simulation (paused during drag)
  - Type-based node colors
  - Directional edges with arrow heads
  - Sophisticated PBR lighting (ambient, directional, point, hemisphere)
- **Debug Mode:**
  - Real-time system state visualization
  - Shows camera state, physics state, interaction modes
  - Displays centered node name and graph statistics

### Node3D.tsx
- High-resolution 3D sphere meshes (64x64 segments) with @react-three/drei
- **Node types:** person (blue), url (orange), mcp (purple)
- **Root node distinction:** Golden color for network origin (invited_by = null)
- **Golden ring:** Flat metallic ring around root node (scales with node on hover)
- **Hover effects:** 1.2x scale animation on entire group (node + ring)
- **Size:** Based on connection count (min 0.3, max 1.0)
- **PBR Materials:** High metalness (0.85), low roughness (0.25), environment reflections
- **Interactive Drag:**
  - Click and drag nodes to reposition
  - Pointer capture ensures smooth dragging
  - Physics pauses during drag
  - Visual position updates every frame via useFrame
- **Pointer events:** stopPropagation on all handlers to prevent conflicts

### Edge3D.tsx
- Directional edges using Line component from @react-three/drei
- Arrow head (cone) at midpoint showing direction (from → to)
- Emerald green color (#10B981)
- 60% opacity
- **Real-time Updates:**
  - Position and rotation updated every frame via useFrame
  - Tracks node movements during physics simulation and drag
  - No memoization (reads mutable node positions directly)

### DebugOverlay.tsx (NEW)
- Fixed overlay showing system state in real-time
- **Mode Indicators:**
  - SPIN/ZOOM: User rotating/zooming camera (green)
  - DRAG NODE: User dragging a node (purple)
  - ANIMATING: Camera animating to target (yellow)
  - INITIALIZING: System starting up (blue)
- **State Display:**
  - Camera state (initializing/animating/user_control)
  - OrbitControls enabled/disabled
  - Node drag active/inactive
  - Physics running/paused
  - Node/edge counts
  - Centered node name
- **User Instructions:** Mode descriptions for interaction patterns

### graphLayout.ts (NEW)
- Pre-computes stable node positions before first render
- Runs force simulation synchronously (300 iterations)
- Eliminates visible displacement on startup
- **Forces:** Same as useForceSimulation (repulsion, spring, centering)
- Returns Map<nodeId, {x, y, z}> for initial positions
- Only used on first initialization (new nodes use smaller random range)

### useForceSimulation.ts
- Physics engine using requestAnimationFrame
- **Forces:**
  - Coulomb repulsion (nodes push apart)
  - Hooke spring attraction (connected nodes pull together)
  - Centering force (prevents drift)
- Updates node x/y/z positions in-place
- Pause/resume capability (paused during camera animation and node drag)

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

## Recent Changes (January 2026)

### Fresh Rebuild Completed (December 2025)
- ✅ Archived old codebase to `/archive` folder
- ✅ Upgraded to Node.js 22
- ✅ Fresh database schema (nodes/edges only)
- ✅ Simplified authentication (email/password)
- ✅ 3D graph with React Three Fiber
- ✅ Fog-of-war visibility system
- ✅ Force-directed physics simulation

### Major Graph Refactoring (January 2026)
- ✅ **Camera State Machine:** Eliminated camera control conflicts with explicit state management (INITIALIZING/ANIMATING/USER_CONTROL)
- ✅ **Pre-computed Stable Positions:** Added graphLayout.ts to eliminate node displacement on startup (300-iteration pre-simulation)
- ✅ **Interactive Node Dragging:** Implemented pointer capture for smooth node repositioning with physics pause
- ✅ **Real-time Edge Updates:** Removed memoization, added useFrame for continuous edge tracking during physics and drag
- ✅ **Enhanced Rendering:** High-resolution spheres (64x64), PBR materials, sophisticated lighting system
- ✅ **Debug Overlay:** Real-time system state visualization with mode indicators and graph statistics
- ✅ **CI/CD Fixes:** Excluded archive folder from Jest test discovery, fixed GitHub Actions warnings

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
- 3D force-directed graph visualization with pre-computed stable positions
- Camera state machine (INITIALIZING/ANIMATING/USER_CONTROL)
- Interactive node dragging with pointer capture
- Real-time edge tracking during physics and drag
- Fog-of-war visibility (3-hop distance)
- Type-based node coloring (person/url/mcp)
- Root node distinction (golden color + metallic ring)
- Node sizing based on connection count
- High-resolution node rendering (64x64 segments)
- PBR materials with metalness and environment reflections
- Sophisticated lighting system (ambient, directional, point, hemisphere)
- Directional edges with arrow heads
- Interactive camera controls (click to focus, orbit, zoom, recenter)
- Physics simulation (spring + repulsion forces, pause during drag)
- Debug overlay with real-time system state visualization
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

### Future Improvements
- Add user node association (link auth.users to nodes table)
- Server-side data fetching with React Server Components
- Skeleton loaders for graph
- Persist user-adjusted node positions in database or localStorage
- Add error boundaries around 3D canvas
- Optimize for mobile (touch controls, smaller viewport)
- Add real-time subscriptions for collaborative editing
- Remove debug overlay for production (or make it toggleable)

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

**Last Updated:** 2026-01-03
**Version:** 0.2.0 (Major Graph Refactoring)
**Maintained by:** kydroon

**Recent Commits:**
- `df3a6da2` - fix(ci): exclude archive folder from Jest test discovery
- `ad9b0480` - enhance(graph): beautify nodes with high-res geometry and PBR materials
- `c41ecd2c` - fix(graph): eliminate initial displacement by setting camera directly on mount
- `5aaa8bcf` - fix(graph): prevent node displacement on hover by persisting positions
- `4634a6aa` - fix(graph): use Array.from for Map iterator compatibility
