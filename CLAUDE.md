# CLAUDE.md

AI Assistant Context Document for be-part-of.net

## Project Overview

**be-part-of.net** is "the anti-social social network" - a consciousness network platform that visualizes human and AI relationships as an interactive 3D graph. The project features a **dual aesthetic system**:

1. **COTOAGA.AI civilized routes** (/, /login, /network) - Modern design with light/dark mode
2. **Terminal aesthetic legacy routes** (/root, /node-zero) - Cyberpunk/Matrix theme with green-on-black

**Production URL:** https://be-part-of-net.vercel.app

## Tech Stack

- **Framework:** Next.js 14.2 (App Router)
- **Language:** TypeScript 5.6
- **UI Library:** React 18.3
- **3D Visualization:** React Three Fiber 8.18 + @react-three/drei 9.122 + Three.js 0.180
- **Styling:** Tailwind CSS 3.4 (dual theme system)
- **Backend/Auth:** Supabase (@supabase/ssr 0.5.1, @supabase/supabase-js 2.45.4)
- **State Management:** React useState + Context API (ThemeContext)
- **Data Fetching:** Native fetch in useEffect (no React Query/SWR)
- **Testing:** Jest 30 + React Testing Library
- **Deployment:** Vercel
- **Package Manager:** npm

## Project Structure

```
be-part-of-net/
├── app/
│   ├── api/
│   │   ├── auth/callback/          # Supabase auth callback
│   │   ├── consciousness/health/   # Health check endpoint
│   │   └── test/
│   │       ├── pan-galactic/       # Test data population (Zaphod's Zoo)
│   │       └── reset/              # Network reset
│   ├── page.tsx                    # Landing page (COTOAGA.AI aesthetic)
│   ├── login/                      # Auth page (COTOAGA.AI aesthetic)
│   ├── network/                    # User dashboard (COTOAGA.AI aesthetic)
│   ├── node-zero/                  # Admin control center (Terminal aesthetic)
│   ├── root/                       # Legacy terminal auth page
│   ├── matrix-test/                # Matrix rain testing page
│   ├── layout.tsx                  # Root layout
│   └── globals.css                 # Global styles + animations
├── components/
│   ├── CivilizedLayout.tsx         # Modern layout wrapper with ThemeProvider
│   ├── ThemeToggle.tsx             # Light/dark mode toggle button
│   ├── MatrixRain.tsx              # Canvas-based Matrix background
│   ├── AuthForm.tsx                # Terminal-styled auth form with Chaos Star
│   ├── GraphVisualization.tsx      # 3D force-directed graph
│   ├── Node3D.tsx                  # 3D node spheres (person/app/mcp types)
│   ├── Edge3D.tsx                  # 3D edge lines
│   ├── SaturnRing.tsx              # Animated rings around centered node
│   ├── InspectPanel.tsx            # Node details panel with connections inspector
│   ├── AddConnectionModal.tsx      # Create new nodes + connections
│   └── ForceSimulation.ts          # Physics simulation hook
├── lib/
│   ├── contexts/ThemeContext.tsx   # Theme provider (light/dark mode)
│   ├── fogOfWar.ts                 # Visibility system (hop-distance based)
│   ├── fonts.ts                    # Typography definitions
│   ├── supabase/
│   │   ├── client.ts               # Client-side Supabase
│   │   └── server.ts               # Server-side Supabase
│   └── types/database.ts           # Database type definitions
├── types/
│   └── graph.ts                    # Graph-specific types
├── supabase/
│   └── migrations/                 # Database migration files (001-007)
├── migrations/
│   └── 001_fresh_start_schema.sql  # New schema (users/nodes/edges)
├── middleware.ts                   # Auth + admin routing logic
└── public/                         # Static assets
```

## Application Routes

### Main Routes

| Route | Design | Auth | Purpose |
|-------|--------|------|---------|
| `/` | COTOAGA.AI | Public | Landing page with philosophy + demo graph |
| `/login` | COTOAGA.AI | Public | Primary auth (login/signup) |
| `/network` | COTOAGA.AI | Protected | User's personal network dashboard |
| `/node-zero` | Terminal | Admin-only | God-mode control center with test controls |
| `/root` | Terminal | Public | Legacy terminal auth (preserved for compatibility) |

### Route Details

#### `/` - Landing Page
- **Status:** Active (COTOAGA.AI aesthetic)
- **Features:**
  - Hero section: "The anti-social social network"
  - Embedded 3D graph demo (Zaphod's Zoo)
  - Philosophy cards: "What we have" vs "What we don't have"
  - Theme toggle (light/dark mode)
  - Sign In button → `/login`
  - Footer with CC BY-SA 4.0 license

#### `/login` - Authentication
- **Status:** Active (COTOAGA.AI aesthetic, primary auth page)
- **Features:**
  - Clean email/password form
  - Toggle between Sign In / Sign Up modes
  - Error/success message handling
  - Theme toggle
  - Links to `/root` (terminal alternative)
- **Post-auth redirect:** `/network` (after email confirmation)

#### `/network` - User Dashboard
- **Status:** Active (COTOAGA.AI aesthetic)
- **Auth:** Middleware redirects to `/login` if not authenticated
- **Features:**
  - Welcome header with user's `node_name`
  - 3D graph of user's personal network
  - Info cards: Total Connections, Network Depth, Temperature (coming soon - show "--")
  - Philosophy section
  - Sign Out button
  - Theme toggle

#### `/node-zero` - Admin Control Center
- **Status:** Active (Terminal aesthetic)
- **Auth:** Admin-only (middleware checks `is_admin` field)
- **Features:**
  - Matrix rain background
  - "Pan-Galactic Gargle Blaster" test controls:
    - MIX DRINK / REFILL GLASS: Populate Zaphod's Zoo (12 nodes + 18 edges)
    - RESET NETWORK: Delete all data (with confirmation)
  - 3D graph visualization
  - Four hardcoded info panels (Active Nodes, System Status, etc.)
  - Sign Out button

#### `/root` - Terminal Auth (Legacy)
- **Status:** Preserved for compatibility
- **Design:** Terminal aesthetic (black/green)
- **Implementation:** Wrapper rendering `<AuthForm />` with Chaos Star

## Key Components

### NEW: CivilizedLayout.tsx
- Wrapper for modern aesthetic routes (/, /login, /network)
- Provides `<ThemeProvider>` context
- Applies COTOAGA.AI design variables
- Terminal routes bypass this component

### NEW: ThemeToggle.tsx
- Light/dark mode toggle button with sun/moon icons
- Persists choice to localStorage (`cotoaga-theme`)
- Applies `dark` class to document element for Tailwind

### NEW: SaturnRing.tsx
- 3D animated Saturn rings around centered node
- Two concentric rings with different rotation speeds
- Used in Node3D when node is focused
- Configurable color and speed

### GraphVisualization.tsx (REFACTORED)
- 3D force-directed graph using React Three Fiber + Three.js
- **Database:** Fetches from `nodes` and `edges` tables (NEW schema)
- **NEW Features:**
  - Fog-of-war visibility system (hop-distance based)
  - Theme-aware colors (Klein Bottle Green / Deep Space Blue)
  - `isDemoMode` prop for Zaphod's Zoo rendering
  - Enforced traversal (can't click nodes beyond hop 4)
- **Existing Features:**
  - Temperature + type-based node colors
  - Node size by connection count
  - Click to focus → smooth camera animation
  - Hover labels
  - PAUSE/RESUME physics simulation
  - OrbitControls

### Node3D.tsx (REFACTORED)
- 3D sphere meshes with metallic/emissive materials
- **NEW Features:**
  - Node types: `person | app | mcp` (not human|ai)
  - Type-based coloring: blue (person), orange (app), purple (mcp)
  - Ghost effect for unconfirmed person nodes (invites)
  - Saturn ring when centered
- **Existing Features:**
  - Temperature gradient overlay
  - Size scales with connection count
  - Hover effects: scale up, show label, pointer cursor
  - Selection ring on click

### Edge3D.tsx
- Simple Line component from @react-three/drei
- Terminal green (#10b981) or theme-aware color
- 40% opacity
- Connects node positions dynamically

### ForceSimulation.ts (REFACTORED)
- Physics engine using requestAnimationFrame
- **NEW:** Nodes track bidirectional `edges` array
- Forces applied:
  - Coulomb repulsion (nodes push apart)
  - Hooke spring attraction (connected nodes pull together)
  - Centering force (keeps graph from drifting)
- Configurable parameters: spring length/strength, repulsion, damping
- Pause/resume capability

### MatrixRain.tsx
- Client-side canvas animation
- Multi-colored Unicode characters (binary, Greek, Cyrillic, Japanese)
- Color-coded by character type
- Fixed position background with 60% opacity
- Staggered drop animation at 40ms intervals
- Font: 16px Noto Sans/DejaVu Sans monospace
- **Usage:** Terminal routes only (/root, /node-zero)

### AuthForm.tsx
- Client component with auth state management
- Embedded Chaos Star SVG (8-pointed arrow star)
- Toggle between login/signup modes
- Terminal-styled form inputs (green borders)
- **Usage:** `/root` route only (legacy)

### InspectPanel.tsx
- Slide-in panel from right side showing node details
- Displays: name, type, description, URL, endpoint_url
- Shows ownership status ("you" indicator)
- **Connections Inspector:** Lists incoming and outgoing edges
  - Outgoing: `→ Target Node Name (count)`
  - Incoming: `← Source Node Name (count)`
  - Helps debug graph structure
- Action buttons (for nodes you control):
  - "+ Add Connection" (opens AddConnectionModal)
  - "Delete Node" (app/mcp only, not person nodes)
- Close on Escape key or outside click

### AddConnectionModal.tsx
- Modal form for creating new nodes and connections
- Radio selection: App or MCP type
- Form fields:
  - Name (required)
  - Description (optional)
  - URL (optional)
  - Endpoint URL (MCP only, optional)
  - Relationship label (optional, private to creator)
- Creates node + edge atomically
- Admin feature: Creates connection from selected node (not just from user's node)

## Authentication Flow

### Current Flow
1. **New user visits `/`** → sees landing page with demo
2. **Click "Sign In"** → `/login` (modern auth page)
3. **Sign up** → email confirmation required → redirect to `/network`
4. **Auto node creation:** PostgreSQL trigger creates node on signup
   - Node name derived from email (e.g., "kurt" from "kurt@cotoaga.net")
   - Handles conflicts with random suffix (e.g., "kurt-a3f2")
   - Initial temperature: 10.0 (hot/new)
5. **Sign in** → redirect to `/network` (or `/node-zero` if admin)

### Middleware Logic
- **Public routes:** `/`, `/login`, `/root`, `/api/auth/callback`
- **Protected routes:** `/network` (any authenticated user)
- **Admin routes:** `/node-zero` (checks `users.is_admin` field)
- **Redirects:**
  - Unauthenticated trying to access protected → `/login`
  - Non-admin trying to access `/node-zero` → `/network`
  - Authenticated on `/login` → `/network`

## Database Schema

### ⚠️ SCHEMA MIGRATION IN PROGRESS

The project is transitioning from the old "consciousness" schema to a new "users/nodes/edges" schema:

- **Legacy schema:** `consciousness_nodes`, `consciousness_edges`, `consciousness_tags`
  - Used by: `/node-zero`, test endpoints (/api/test/*)
  - Location: `supabase/migrations/001-007`

- **New schema:** `users`, `nodes`, `edges`
  - Used by: GraphVisualization, landing page, `/network` dashboard
  - Location: `migrations/001_fresh_start_schema.sql`

**Both schemas currently exist in the database.** Full migration pending.

### New Schema (Active for Visualization)

#### users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  temperature DECIMAL(4,1) DEFAULT 5.0,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Key points:**
- Separate from auth.users (custom user metadata)
- `is_admin` controls access to `/node-zero`
- Temperature tracked per user (0-10 scale)

#### nodes
```sql
CREATE TABLE nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,              -- 'person' | 'app' | 'mcp'
  name TEXT NOT NULL,
  description TEXT,
  email TEXT,                      -- Person-specific
  confirmed BOOLEAN DEFAULT TRUE,  -- FALSE for unconfirmed invites
  url TEXT,                        -- External website
  endpoint_url TEXT,               -- MCP endpoint for AI agents
  controlled_by UUID[] DEFAULT '{}',  -- Array of user IDs (multi-ownership)
  is_demo BOOLEAN DEFAULT FALSE,   -- Zaphod's Zoo flag
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Key points:**
- **Node types:** person (human), app (AI app), mcp (MCP server)
- **controlled_by array:** Multiple users can control one node (personas)
- **confirmed flag:** Unconfirmed person nodes = pending invites (ghost visual)
- **is_demo flag:** Separates test data (Zaphod's Zoo) from real users

#### edges
```sql
CREATE TABLE edges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_node_id UUID NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
  to_node_id UUID NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
  label TEXT,                      -- Private relation tag (visible to creator only)
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  is_demo BOOLEAN DEFAULT FALSE,   -- Zaphod's Zoo flag
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(from_node_id, to_node_id)
);
```

**Key points:**
- Directed edges (from → to)
- **label field:** Private tag visible only to creator (app-layer privacy)
- **created_by:** Tracks who created the connection
- Unique constraint prevents duplicate edges

### Database Functions

```sql
get_user_nodes(user_id UUID)           -- Get nodes controlled by user
get_hop_distance(source_node_id UUID)  -- BFS for fog-of-war visibility (recursive CTE)
update_updated_at_column()             -- Auto-update timestamp trigger
```

### Auto Node Creation (Migration 007)

**PostgreSQL Trigger:** `on_auth_user_created`
- Fires on INSERT to `auth.users`
- Creates corresponding `consciousness_node` (legacy schema)
- Node name derived from email prefix
- Handles naming conflicts with random suffix
- Sets initial temperature to 10.0

### Row Level Security (RLS)

**users table:**
- Users can read/update only their own record

**nodes table:**
- Anyone can read (discovery)
- Authenticated users can insert
- Users can update/delete nodes they control (controlled_by array)

**edges table:**
- Anyone can read
- Users can create/update/delete edges they created

### Indexes
- `idx_nodes_type` - Filter by node type
- `idx_nodes_controlled_by` - GIN index for array operations
- `idx_nodes_is_demo` - Separate demo from real data
- `idx_edges_from_node`, `idx_edges_to_node` - Traversal performance

## API Endpoints

### Authentication
- `GET/POST /api/auth/callback` - Supabase OAuth callback (email confirmation)

### Health/Status
- `GET /api/consciousness/health` - System health check (mostly theatrical JSON response)

### Test/Development Endpoints
⚠️ **These should be admin-only but are currently accessible to any authenticated user:**

#### `POST /api/test/pan-galactic`
- **Purpose:** Populate "Zaphod's Zoo" test network
- **Creates:** 12 Hitchhiker's Guide character nodes + 18 edges
- **Characters:** Zaphod, Marvin, Ford, Arthur, Trillian, Slartibartfast, Deep Thought, Eddie, Vogon, Fenchurch, Random Dent, Agrajag
- **Temperature range:** 0.0 (Deep Thought) to 10.0 (Zaphod/Eddie)
- **Links:** Current user's auth to "Zaphod Beeblebrox" node
- **Response:** `{ success, message, stats: { nodes_created, edges_created, user_is_now } }`

#### `POST /api/test/reset`
- **Purpose:** Delete all data (edges then nodes, respects FK constraints)
- **Auth:** Requires authentication
- **UI:** Confirmation dialog before calling
- **Response:** `{ success, message }`

### Missing Endpoints (Not Yet Built)
- ❌ `POST /api/nodes` - Create new node
- ❌ `PUT /api/nodes/:id` - Update node
- ❌ `DELETE /api/nodes/:id` - Delete individual node
- ❌ `POST /api/edges` - Create connection
- ❌ `POST /api/invitations` - Send invitation
- ❌ `GET /api/network/stats` - Real statistics for info cards

## Design System

### COTOAGA.AI Aesthetic (Modern Routes)

#### Color Palette
```css
/* Light Mode */
--color-klein-bottle-green: #00A86B;    /* Primary accent */
--color-warm-canvas: #FAFAFA;           /* Background */

/* Dark Mode */
--color-deep-space-blue: #0088FF;       /* Primary accent */
--color-midnight-void: #0A0A0A;         /* Background */

/* Universal */
--color-soft-gray: #6B7280;             /* Text secondary */
```

#### Typography
- **Body:** Inter (sans-serif)
- **Display:** Space Grotesk (modern display)
- **Terminal:** JetBrains Mono (monospace for code)

#### Components
- Rounded corners (6px typically)
- Subtle shadows
- Smooth transitions (200-300ms)
- Focus rings with accent colors
- Theme-aware via Tailwind `dark:` prefix

### Terminal Aesthetic (Legacy Routes)

#### Color Palette
```css
--color-terminal-green: #00ff00;        /* Main text */
--color-terminal-green-dim: #10b981;    /* Secondary */
--color-terminal-bg: #000000;           /* Background */
```

#### Design Principles
- Sharp corners (no border-radius)
- Green/black only (no other colors)
- Monospace fonts exclusively
- Hover effects: invert colors (green bg, black text)
- Matrix rain background

#### Custom Classes
- `.terminal-input` - Form inputs with green border
- `.terminal-button` - Buttons with hover invert effect
- `.terminal-link` - Underlined green links
- `.chaos-star-auth` - 15s rotating Chaos Star
- `.matrix-rain` - Fixed position canvas overlay

#### Animations
- `chaosRotate` - 360° rotation over 15s
- `chaosPulse` - 2s scaling pulse on Chaos Star center

### Tailwind Configuration
- **Dark mode:** Class-based (`dark:` prefix)
- **Applied via:** ThemeProvider context on document element
- **Persistence:** localStorage (`cotoaga-theme`)
- **Default:** Light mode

## NEW Features (Since October 2025)

### 1. Fog-of-War Visibility System
**File:** `lib/fogOfWar.ts`

Hop-distance-based rendering with 5 visibility levels:
- **Hop 0 (Centered):** Full opacity, Saturn ring, clickable
- **Hop 1:** Full opacity, labels visible, clickable
- **Hop 2-3:** Reduced opacity (0.75-0.5), labels visible, clickable
- **Hop 4:** Very faint (0.15), no labels, **NOT clickable** (enforced traversal)
- **Hop 5+:** Invisible (0.0)

**Enforced traversal:** Users must click closer nodes to "move" toward distant nodes. Prevents long-range jumps across network.

**Implementation:** Client-side BFS calculation (database has `get_hop_distance()` function but not used yet).

### 2. Theme Context Provider
**File:** `lib/contexts/ThemeContext.tsx`

- Light/dark mode toggle across entire app (COTOAGA.AI routes only)
- localStorage persistence (`cotoaga-theme` key)
- Applies `dark` class to document for Tailwind CSS
- Default: light mode

### 3. Saturn Ring Animation
**File:** `components/SaturnRing.tsx`

- Animated rotating rings around centered node
- Visual emphasis for focused exploration
- Two concentric rings with different opacity/rotation
- Configurable color and rotation speed

### 4. Auto Node Creation on Signup
**Migration:** `supabase/migrations/007_auto_create_user_nodes.sql`

- PostgreSQL trigger automatically creates node when user signs up
- Node name derived from email (e.g., "kurt" from "kurt@cotoaga.net")
- Handles conflicts with random suffix (e.g., "kurt-a3f2")
- Sets initial temperature to 10.0 (hot/new)

### 5. Admin System
- `users.is_admin` field controls access to `/node-zero`
- Middleware enforces admin-only routes
- Non-admins redirected to `/network`

### 6. Node Types: person, app, mcp
**Old:** `human | ai`
**New:** `person | app | mcp`

- **person:** Human users (blue)
- **app:** AI applications (orange)
- **mcp:** MCP servers (purple)

Type-based coloring in 3D visualization with temperature overlay.

### 7. Unconfirmed Person Nodes
- Person nodes can have `confirmed = FALSE`
- Represents invited but not-yet-claimed nodes
- Ghost effect visual (very faint opacity)
- Privacy model for invitations

### 8. Controlled-By Array
- Node ownership via `controlled_by: UUID[]` array
- Multiple users can control single node (personas/shared accounts)
- RLS policies check array membership

### 9. Demo Data Flag
- `nodes.is_demo` and `edges.is_demo` flags
- Separates Zaphod's Zoo from real user data
- GraphVisualization filters by `isDemoMode` prop

### 10. Private Edge Labels
- Each edge has `label` field (private to creator)
- `created_by` field tracks creator
- Application-layer privacy (visible only to creator)

## Environment Variables

Required in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Production (Vercel):
```env
NEXT_PUBLIC_CONSCIOUSNESS_NETWORK=be-part-of.net
```

## Development

### Scripts
```bash
npm run dev                      # Start dev server
npm run build                    # Production build
npm run start                    # Start production server
npm run lint                     # ESLint check
npm run type-check               # TypeScript check
npm run test                     # Run Jest tests
npm run test:watch               # Jest watch mode
npm run test:ci                  # CI tests with coverage
npm run consciousness:verify     # Full check (type + lint + test)
npm run reality:sync             # Supabase db push && reset
npm run vercel-build             # Vercel build (type-check + lint + build)
```

### Build Process
Vercel build command: `npm run vercel-build`
- Runs type-check
- Runs lint
- Runs build
- **Note:** Tests excluded from vercel-build to avoid React act() production errors

## Supabase Configuration

### Dashboard Settings
1. Enable Email Auth provider
2. Site URL: `https://be-part-of-net.vercel.app`
3. Redirect URLs: `https://be-part-of-net.vercel.app/api/auth/callback`

### Auth Helpers
- Server components: Use `@/lib/supabase/server` with cookies
- Client components: Use `@/lib/supabase/client`
- Middleware: Use `@supabase/ssr` with cookie helpers

## Testing

- **Framework:** Jest with jsdom environment
- **Setup:** `jest-setup.ts` for custom matchers
- **Config:** `jest.config.js` with TypeScript support
- **Coverage:** Enabled in CI mode

## Deployment

### Vercel Configuration
- Region: `iad1` (US East)
- Max duration for consciousness API: 30s
- Framework detection: Next.js
- Custom headers for API caching (60s stale-while-revalidate)

### Production Checklist
1. Environment variables configured in Vercel
2. Supabase URLs match production domain
3. Build passes type-check + lint
4. Matrix rain renders correctly (check canvas performance on terminal routes)
5. Theme toggle persists across sessions

## Current State: What's Built vs. What's Planned

### ✅ Fully Implemented
- Supabase authentication (email-based with confirmation)
- Middleware-based route protection + admin gating
- **Dual aesthetic system** (COTOAGA.AI + terminal)
- **Theme toggle** (light/dark mode)
- 3D force-directed graph visualization
- **Fog-of-war visibility system** with enforced traversal
- **Auto node creation** on signup via PostgreSQL trigger
- Temperature + type-based node coloring
- Node sizing based on connection count
- Interactive camera controls (click to focus, orbit, zoom)
- **Saturn ring animation** on centered node
- Physics simulation with pause/resume
- Test data population ("Pan-Galactic" / Zaphod's Zoo)
- Network reset functionality
- Matrix rain background (terminal routes)
- **Admin system** (is_admin field + middleware)

### ⚠️ Partially Implemented
- **Database schema migration** - Both schemas exist, full migration pending
- **Info cards** on `/network` - UI exists but shows "--" (queries not implemented)
- **Edge labels** - Database field exists but no UI to add/view
- **Unconfirmed nodes** - Visual ghost effect exists but no invite UI

### ❌ Not Yet Implemented
- **Node creation UI** - No form to add new person/app/mcp nodes
- **Edge creation UI** - No way to manually connect nodes
- **Invitation system** - No invite sending/accepting flow
- **Tag interface** - Edge labels exist but no UI
- **Node detail modal** - Clicking nodes doesn't show full profile
- **Real-time updates** - No Supabase subscriptions (must refresh)
- **Profile editing** - No way to update your own node after creation
- **Search/filter** - No way to search nodes or filter by type/temperature
- **Node removal** - No delete button for individual nodes (only full reset)
- **Admin-gating for test endpoints** - `/api/test/*` accessible to all authenticated users
- **Real statistics** - Info cards on `/network` need database queries
- **Server-side graph data** - Currently client-side useEffect fetching

### 🔌 Integration Pattern for External Apps
To add an external app (like KHAOS-Researcher):
1. **Current method:** Direct database insert (no UI)
2. **Future method:** Will need `POST /api/nodes` endpoint + UI form
3. **Fields needed:** `name`, `type='app'`, `url`, `endpoint_url` (MCP), `temperature`, `controlled_by` array

## Known Issues & Technical Debt

### Critical Issues

1. **Schema Migration Incomplete**
   - Both `consciousness_nodes` and `nodes` tables exist
   - `/node-zero` and test endpoints use old schema
   - GraphVisualization uses new schema
   - Need to complete migration and remove legacy tables

2. **Test Endpoints Not Admin-Gated**
   - `/api/test/pan-galactic` and `/api/test/reset` accessible to any authenticated user
   - Should check `is_admin` field

3. **Info Cards Not Populated**
   - `/network` page shows "--" for all stats
   - Need real database queries for connections, depth, temperature

### Design/UX Issues

1. **Terminal Routes Don't Have Theme Toggle**
   - `/root` and `/node-zero` stuck in terminal aesthetic
   - No consistency with modern routes

2. **Hardcoded Demo Node ID**
   - GraphVisualization uses `'a1111111-1111-1111-1111-111111111111'` as demo center
   - Not guaranteed to match actual Zaphod node ID

3. **Empty Network for Single User**
   - New user sees only themselves on `/network`
   - No sample connections or onboarding

4. **No Profile Editing**
   - Auto-created node on signup, then locked
   - User can't update node_name, description, etc.

### Technical Debt

1. **Two Migration Systems**
   - `supabase/migrations/` vs `migrations/`
   - Unclear which runs on production

2. **localStorage Theme Not SSR-Safe**
   - Theme persists client-side only
   - Could cause hydration mismatch

3. **Client-Side Visibility Calculation**
   - BFS hop distance calculated in browser
   - Database has `get_hop_distance()` function not used
   - Inefficient for large graphs (>1000 nodes)

4. **Data Fetching Pattern**
   - Dashboard is client component with useEffect
   - Not optimal for Next.js App Router (should use server components)
   - No React Query or SWR for caching

5. **No Error Boundaries**
   - 3D canvas can crash and take down entire page
   - Need error boundaries for graceful fallback

6. **No Loading States**
   - Graph appears suddenly when data loads
   - Need skeleton loaders

## Design Philosophy

This project embraces a **dual aesthetic**:

### COTOAGA.AI Routes (Modern)
1. **Accessibility:** Light/dark mode, readable fonts, clear hierarchy
2. **Minimalism:** Clean interface, focus on content
3. **Professionalism:** Suitable for general audiences
4. **Customization:** User-controlled theme

### Terminal Routes (Legacy)
1. **Minimalism:** Black backgrounds, green text, no decoration
2. **Functionality:** Every element serves the "control center" narrative
3. **Immersion:** Matrix rain and Chaos Star reinforce mystical/technical theme
4. **High contrast:** Accessibility through stark green/black

## Future Considerations

### High Priority (Core Functionality Gaps)
- **Complete schema migration** - Remove legacy consciousness tables
- **Node creation UI** - Form to add person/app/mcp nodes
- **Edge creation UI** - Manual connection interface
- **Invitation system** - Send/accept invites with unconfirmed nodes
- **Node detail modal** - Full profile view on click
- **Profile editing** - Update your own node info
- **Real statistics** - Query actual data for info cards
- **Admin-gate test endpoints** - Check is_admin before allowing reset/populate

### Medium Priority (UX Improvements)
- **Real-time updates** - Supabase subscriptions for live graph
- **Search/filter** - Find nodes by name, type, temperature
- **Tag interface** - UI to add/view private edge labels
- **Node removal** - Individual delete (not just full reset)
- **Server-side data fetching** - Use Next.js server components
- **Error boundaries** - Graceful fallback for 3D canvas crashes
- **Loading states** - Skeleton loaders for graph data

### Low Priority (Polish)
- Additional Matrix effects (glitch text, scanlines) on terminal routes
- Export/import graph data (JSON format)
- Graph layout presets (circular, hierarchical, force-atlas)
- Internationalization support
- Keyboard shortcuts for graph navigation
- Node/edge animation presets

### Technical Improvements
- Migrate to server-side graph rendering (RSC)
- Add React Query or SWR for better data management
- Use database `get_hop_distance()` function instead of client-side BFS
- Implement pagination for large graphs (>1000 nodes)
- Add WebGL performance optimizations
- Set up proper monitoring (Sentry, LogRocket)

---

**Last Updated:** 2025-11-17
**Project Version:** 0.1.0
**Maintained by:** kydroon

**Recent Commits:**
- `9b56aec9` - node creation (Nov 9, 2025)
- `13eb3576` - clear visibility statistics, centered node info, new footer credits
- `caf7306d` - New Zoo DB Schema (complete schema replacement)
- `42a5d378` - build problem fix
