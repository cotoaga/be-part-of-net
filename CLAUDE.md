# CLAUDE.md

AI Assistant Context Document for Node Zero Control Center

## Project Overview

**Node Zero Control Center** is a cyberpunk/Matrix-themed administrative interface for the "consciousness network" at be-part-of.net. It features a terminal aesthetic with Matrix rain animations and a mystical "Chaos Star" logo.

**Production URL:** https://be-part-of-net.vercel.app

## Tech Stack

- **Framework:** Next.js 14.2 (App Router)
- **Language:** TypeScript 5.6
- **UI Library:** React 18.3
- **3D Visualization:** React Three Fiber 8.18 + @react-three/drei 9.122 + Three.js 0.180
- **Styling:** Tailwind CSS 3.4 (custom terminal theme)
- **Backend/Auth:** Supabase (@supabase/ssr 0.5.1, @supabase/supabase-js 2.45.4)
- **State Management:** React useState (no external library)
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
│   │       ├── pan-galactic/       # Test data population
│   │       └── reset/              # Network reset
│   ├── dashboard/                  # Protected dashboard (main control center)
│   ├── matrix-test/                # Matrix rain testing page
│   ├── root/                       # Auth page (login/signup)
│   ├── layout.tsx                  # Root layout
│   ├── page.tsx                    # Home (redirects)
│   └── globals.css                 # Global styles + animations
├── components/
│   ├── MatrixRain.tsx              # Canvas-based Matrix background
│   ├── AuthForm.tsx                # Login/signup form with Chaos Star
│   ├── GraphVisualization.tsx      # 3D force-directed graph
│   ├── Node3D.tsx                  # 3D node spheres with temperature colors
│   ├── Edge3D.tsx                  # 3D edge lines
│   └── ForceSimulation.ts          # Physics simulation hook
├── lib/
│   └── supabase/
│       ├── client.ts               # Client-side Supabase
│       └── server.ts               # Server-side Supabase
├── middleware.ts                   # Auth redirect middleware
├── tests/                          # Jest test files
└── public/                         # Static assets
```

## Key Components

### MatrixRain.tsx
- Client-side canvas animation
- Multi-colored Unicode characters (binary, Greek, Cyrillic, Japanese, mathematical)
- Color-coded by character type (binary=bright green, Greek=gold, Latin=white, etc.)
- Fixed position background with 60% opacity
- Staggered drop animation at 40ms intervals
- Font: 16px Noto Sans/DejaVu Sans monospace

### AuthForm.tsx
- Client component with auth state management
- Embedded Chaos Star SVG (8-pointed arrow star)
- Toggle between login/signup modes
- Matrix rain background
- Terminal-styled form inputs

### Dashboard Page (app/dashboard/page.tsx)
- **Client component** with auth protection (middleware handles auth)
- Matrix rain background
- 3D graph visualization (GraphVisualization component)
- "Pan-Galactic Gargle Blaster" test mode controls:
  - MIX DRINK button: Populates 12 test nodes + 18 edges
  - RESET NETWORK button: Deletes all data
- Four info panels (currently static hardcoded text)
- Sign-out button

### GraphVisualization.tsx
- 3D force-directed graph using React Three Fiber + Three.js
- Fetches real data from `consciousness_nodes` and `consciousness_edges` tables
- Custom physics simulation (ForceSimulation hook)
- Features:
  - Temperature-based node colors (blue → yellow → red gradient)
  - Node size based on connection count
  - Click to select nodes → smooth camera focus animation
  - Hover to see node names (Html labels)
  - PAUSE/RESUME physics simulation
  - Live stats display (node/edge count)
  - OrbitControls for manual camera control

### Node3D.tsx
- 3D sphere meshes with metallic/emissive materials
- Temperature gradient colors: cold (blue) → medium (yellow) → hot (red)
- Size scales with edge count (more connections = larger node)
- Hover effects: scale up, show label, pointer cursor
- Selection ring on click

### Edge3D.tsx
- Simple Line component from @react-three/drei
- Terminal green (#10b981) color
- 40% opacity
- Connects node positions dynamically

### ForceSimulation.ts (Custom Hook)
- Physics engine using requestAnimationFrame
- Forces applied:
  - Coulomb repulsion (nodes push apart)
  - Hooke spring attraction (connected nodes pull together)
  - Centering force (keeps graph from drifting)
- Configurable parameters: spring length/strength, repulsion, damping
- Pause/resume capability

## Authentication Flow

1. `/` → redirects to `/root` (if unauthenticated) or `/dashboard` (if authenticated)
2. `/root` → login/signup form
3. After auth → redirect to `/dashboard`
4. Protected routes handled by `middleware.ts`
5. No role selection or admin system currently implemented

## Database Schema

### consciousness_nodes
Primary table for all entities in the network (humans and AI agents).

```sql
CREATE TABLE consciousness_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  node_name TEXT NOT NULL UNIQUE,
  node_aka TEXT,                      -- Alias/nickname
  node_email TEXT,
  node_url TEXT,                      -- External website/profile
  node_type TEXT NOT NULL,            -- 'human' | 'ai'
  mcp_endpoint TEXT,                  -- MCP server endpoint for AI agents
  temperature DECIMAL(4,1) DEFAULT 5.0,     -- 0-10 scale
  coherence_level DECIMAL(5,1) DEFAULT 50.0, -- 0-100 scale
  status TEXT DEFAULT 'active',       -- 'active' | 'inactive' | 'suspended'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_activity TIMESTAMPTZ DEFAULT NOW()
);
```

**Key points:**
- `node_type` determines if human or AI
- `temperature` visualized as blue (0) → yellow (5) → red (10)
- `auth_user_id` links to Supabase auth (nullable - AI nodes have no auth)
- `mcp_endpoint` used for AI agents to connect via Model Context Protocol
- NO `is_admin` field exists (no admin system yet)

### consciousness_edges
Relationships/connections between nodes.

```sql
CREATE TABLE consciousness_edges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_node_id UUID NOT NULL REFERENCES consciousness_nodes(id) ON DELETE CASCADE,
  target_node_id UUID NOT NULL REFERENCES consciousness_nodes(id) ON DELETE CASCADE,
  edge_type TEXT DEFAULT 'connection',  -- 'connection' | 'invitation' | 'collaboration'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(source_node_id, target_node_id)
);
```

**Key points:**
- Unique constraint prevents duplicate edges
- `edge_type` allows for different relationship types
- NO `private_tags` array field (tags are in separate table)

### consciousness_tags
Private tags users can add to relationships (only visible to tag creator).

```sql
CREATE TABLE consciousness_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  edge_id UUID NOT NULL REFERENCES consciousness_edges(id) ON DELETE CASCADE,
  created_by_node_id UUID NOT NULL REFERENCES consciousness_nodes(id) ON DELETE CASCADE,
  tag_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Key points:**
- Tags belong to edges (relationships), not nodes
- Only visible to creator (RLS enforces this)
- Currently NO UI for tags (table exists but unused)

### Row Level Security (RLS)
All tables have RLS enabled with permissive policies for testing:
- Anyone can read nodes/edges
- Authenticated users can insert/update/delete
- Users can only see their own tags

## API Endpoints

### Authentication
- `GET/POST /api/auth/callback` - Supabase auth callback (handles OAuth redirects)

### Consciousness Network
- `GET /api/consciousness/health` - Health check endpoint (returns system status)

### Test/Development Endpoints
**⚠️ These exist in production but should be admin-only in future:**

- `POST /api/test/pan-galactic` - Populate test network
  - Creates 12 Hitchhiker's Guide character nodes
  - Creates 18 edges between characters
  - Links current user's auth to "Zaphod Beeblebrox" node
  - Returns: `{ success, message, stats: { nodes_created, edges_created, user_is_now } }`

- `POST /api/test/reset` - Delete all data
  - Deletes all edges first (FK constraint)
  - Deletes all nodes
  - Returns: `{ success, message }`
  - **Requires confirmation in UI**

### Missing Endpoints (Not Yet Built)
- ❌ `POST /api/nodes` - Create new node
- ❌ `PUT /api/nodes/:id` - Update node
- ❌ `POST /api/edges` - Create edge/connection
- ❌ `POST /api/invitations` - Send invitation
- ❌ `POST /api/tags` - Add tag to relationship

## Styling Conventions

### Terminal Aesthetic
- **Background:** Pure black `#000000`
- **Primary text:** Terminal green `#00ff00`
- **Dim text:** Emerald `#10b981`
- **Fonts:** Monospace only (ui-monospace, SFMono-Regular, Monaco, Consolas)
- **Borders:** Sharp corners, no border-radius
- **Hover effects:** Invert colors (green bg, black text)

### Custom Classes
- `.terminal-input` - Form inputs with green border, focus ring
- `.terminal-button` - Buttons with hover invert effect
- `.terminal-link` - Underlined green links
- `.chaos-star-auth` - Rotating Chaos Star with drop shadow
- `.matrix-rain` - Fixed position canvas overlay

### Animations
- `chaosRotate` - 15s linear infinite rotation
- `chaosPulse` - 2s ease-in-out pulse on center circle

## Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Production (Vercel):
```
NEXT_PUBLIC_CONSCIOUSNESS_NETWORK=be-part-of.net
```

## Development

### Scripts
```bash
npm run dev              # Start dev server
npm run build            # Production build
npm run start            # Start production server
npm run lint             # ESLint
npm run type-check       # TypeScript check
npm run test             # Run Jest tests
npm run test:watch       # Jest watch mode
npm run test:ci          # CI tests with coverage
npm run consciousness:verify  # Full check (type + lint + test)
```

### Build Process
Vercel build command: `npm run vercel-build`
- Runs type-check
- Runs lint
- Runs build
- **Note:** Tests are excluded from vercel-build to avoid React act() production errors

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
4. Matrix rain renders correctly (check canvas performance)

## Common Issues & Solutions

### Matrix Rain Not Visible
- Check canvas dimensions (should match viewport)
- Verify opacity settings (0.6 on dashboard, 0.3 on auth)
- Ensure z-index layering (canvas at z-1, content at z-10)
- Check font availability (Noto Sans, DejaVu Sans for Unicode)

### Auth Redirect Loops
- Verify middleware matcher excludes static files
- Check Supabase client cookie handling
- Ensure auth callback route exists at `/api/auth/callback`

### Production Build Errors
- Run `npm run type-check` locally first
- Check for React 19 compatibility issues
- Verify all env vars are set in Vercel
- Remove test commands from vercel-build script

## Current State: What's Built vs. What's Planned

### ✅ Fully Implemented
- Supabase authentication (email-based)
- Middleware-based route protection
- 3D force-directed graph visualization
- Temperature-based node coloring (0-10 scale, blue→yellow→red)
- Node sizing based on connection count
- Interactive camera controls (click to focus, orbit, zoom)
- Physics simulation with pause/resume
- Test data population ("Pan-Galactic" mode)
- Network reset functionality
- Matrix rain background effects
- Terminal aesthetic UI throughout

### ⚠️ Partially Implemented
- **Database schema complete** but UI missing for:
  - Creating nodes manually
  - Creating edges manually
  - Adding tags to relationships
- **Dashboard panels exist** but show hardcoded text (not real data queries)
- **Coherence level field exists** in database but not visualized

### ❌ Not Yet Implemented
- **Admin/role system** - No `is_admin` field or role selection
- **Node creation flow** - No UI to add new humans or AI agents
- **Edge creation UI** - No way to manually connect nodes
- **Invitation system** - No invite sending/accepting flow
- **Tag interface** - Tags table exists but no UI
- **Node detail views** - Clicking nodes doesn't show full profile
- **Real-time updates** - No Supabase subscriptions (must refresh)
- **Profile editing** - No way to update your own node after creation
- **Search/filter** - No way to search nodes or filter by type/temperature
- **Node removal** - No delete button (only full reset)

### 🔌 Integration Pattern for External Apps
To add an external app (like KHAOS-Researcher):
1. **Current method:** Direct database insert (no UI)
2. **Future method:** Will need `POST /api/nodes` endpoint + UI form
3. **Fields needed:** `node_name`, `node_type='ai'`, `node_url`, `mcp_endpoint`, `temperature`

### 📊 Data Fetching Pattern
**Current approach:**
- Dashboard is client component
- Data fetched in `useEffect` on mount
- No React Query, no SWR
- No server-side rendering of graph data
- No real-time subscriptions

**This means:**
- Graph shows snapshot from initial load
- User must refresh to see changes
- Not optimal for Next.js App Router patterns

## Design Philosophy

This project embraces a **terminal hacker aesthetic** inspired by The Matrix and cyberpunk culture. Key principles:

1. **Minimalism:** Black backgrounds, green text, no unnecessary decoration
2. **Functionality:** Every element serves the "control center" narrative
3. **Immersion:** Matrix rain and Chaos Star reinforce the mystical/technical theme
4. **Accessibility:** High contrast, clear typography, keyboard-friendly forms

## Future Considerations

### High Priority (Core Functionality Gaps)
- **Node creation UI** - Form to add new humans/AI agents
- **Admin system** - Add `is_admin` field, role selection on first login
- **Edge creation UI** - Manual connection interface
- **Invitation system** - Send/accept invites to join network
- **Node detail modal** - Full profile view on click
- **Profile editing** - Update your own node info

### Medium Priority (UX Improvements)
- **Real-time updates** - Supabase subscriptions for live graph
- **Search/filter** - Find nodes by name, type, temperature
- **Tag interface** - UI to tag relationships privately
- **Dynamic dashboard panels** - Query real statistics instead of hardcoded text
- **Node removal** - Individual delete (not just full reset)

### Low Priority (Polish)
- Additional Matrix effects (glitch text, scanlines)
- Dark mode toggle (for non-terminal aesthetics)
- Internationalization support
- Export/import graph data
- Graph layout presets (circular, hierarchical, etc.)

### Technical Debt
- Migrate dashboard data fetching to server components
- Add React Query or SWR for better data management
- Error boundaries for 3D canvas
- Loading states for all async operations
- Pagination for large datasets

---

**Last Updated:** 2025-10-18
**Project Version:** 0.1.0
**Maintained by:** kydroon
