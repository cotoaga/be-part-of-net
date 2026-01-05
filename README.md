# ⊙ be-part-of.net

**The Anti-Social Social Network** - A consciousness network platform that visualizes human and AI relationships as an interactive 3D graph.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/cotoaga/be-part-of-net)

🌐 **Live Demo:** [https://be-part-of-net.vercel.app](https://be-part-of-net.vercel.app)

## Features

### 3D Force-Directed Graph Visualization
- **Interactive 3D Canvas** powered by React Three Fiber + Three.js
- **Physics Simulation** with Coulomb repulsion and Hooke spring forces
- **Fog-of-War Visibility** showing nodes within 3-hop distance
- **Pre-computed Stable Positions** to eliminate displacement on startup

### Advanced Camera Control
- **State Machine Architecture** (INITIALIZING → ANIMATING → USER_CONTROL)
- **Smooth Camera Animation** when selecting nodes
- **OrbitControls** for free camera movement (rotate, zoom, pan)
- **Recenter Button** to reset view to centered node

### Node Rendering
- **High-Resolution Spheres** (64×64 segments) with PBR materials
- **Type-Based Colors:** Person (blue), URL (orange), MCP (purple)
- **Root Node Distinction:** Golden sphere with metallic ring
- **Interactive Dragging:** Click and drag nodes to reposition
- **Dynamic Sizing:** Based on connection count (min 0.3, max 1.0)
- **Always-Visible Labels:** Node names permanently displayed with larger text

### Edge Rendering
- **Directional Edges** with arrow heads showing relationship direction
- **Real-time Updates** tracking node movements during physics and drag
- **Emerald Green Color** (#10B981) at 60% opacity

### Debug Mode
- **Real-time State Visualization** overlay (top-right corner)
- **Mode Indicators:** SPIN/ZOOM, DRAG NODE, ANIMATING, INITIALIZING
- **System Stats:** Camera state, physics state, node/edge counts
- **Centered Node Display** showing current focus

### Authentication & Data
- **Supabase Authentication** with email/password
- **Simple Schema:** Nodes (person/url/mcp) + Edges (relations)
- **Test Data Endpoint** to populate sample network
- **Light/Dark Theme** toggle

## Tech Stack

- **Frontend:** Next.js 14.2 (App Router), React 18.3, TypeScript 5.6
- **3D Graphics:** React Three Fiber 8.18, @react-three/drei 9.122, Three.js 0.180
- **Backend:** Supabase (Auth + Database)
- **Styling:** Tailwind CSS 3.4
- **Deployment:** Vercel
- **Runtime:** Node.js 22

## Quick Start

### Prerequisites
- Node.js 22+ (see `.nvmrc`)
- npm
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/cotoaga/be-part-of-net.git
   cd be-part-of-net
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

4. **Configure Supabase**
   - Enable Email Auth provider
   - Set Site URL: `http://localhost:3000` (dev) or your production URL
   - Set Redirect URLs: `http://localhost:3000/api/auth/callback`
   - Run the migration: `supabase/migrations/100_fresh_start_schema.sql`

5. **Run development server**
   ```bash
   npm run dev
   ```

6. **Visit the app**

   Open [http://localhost:3000](http://localhost:3000)

### Test Credentials

Pre-populated in login form:
- Email: `kurt@cotoaga.net`
- Password: `!mp3riuMalphA`

## Usage

### Network Dashboard (`/network`)

1. **Reset Network** - Populates test data (7 nodes, 7 edges)
2. **Recenter View** - Resets camera to centered node
3. **Interact with Graph:**
   - **Click node** to center view and animate camera
   - **Drag camera** to orbit around graph
   - **Scroll** to zoom in/out
   - **Drag nodes** to reposition them (physics pauses)
   - **Hover nodes** to see labels

### Understanding the Graph

**Node Types:**
- 🔵 **Blue Sphere** - Person (human user)
- 🟠 **Orange Sphere** - URL (web resource)
- 🟣 **Purple Sphere** - MCP (AI agent server)
- 🟡 **Golden Sphere with Ring** - Root node (network origin)

**Edge Relations:**
- `invited` - Person invited another person
- `knowing` - Person knows person
- `working_with` - Person works with person
- `created` - Person created URL/MCP
- `using` - Person uses URL/MCP

**Visibility:**
- Full opacity (1.0): 0-1 hops from center
- 70% opacity (0.7): 2 hops from center
- 40% opacity (0.4): 3 hops from center
- Hidden (0.0): 4+ hops from center

## Development

### Scripts

```bash
npm run dev              # Start dev server (localhost:3000)
npm run build            # Production build
npm run start            # Start production server
npm run lint             # Run ESLint
npm run type-check       # Run TypeScript compiler check
npm run test             # Run Jest tests
npm run test:ci          # Run tests in CI mode with coverage
```

### Project Structure

```
be-part-of-net/
├── app/                    # Next.js App Router pages
│   ├── page.tsx            # Login page
│   ├── network/            # Network dashboard
│   └── api/                # API routes (auth, reset)
├── components/
│   ├── Graph/              # 3D graph components
│   │   ├── GraphCanvas.tsx # Main canvas + camera state machine
│   │   ├── Node3D.tsx      # Node rendering + drag
│   │   ├── Edge3D.tsx      # Edge rendering
│   │   └── DebugOverlay.tsx# Debug state overlay
│   ├── Auth/               # Authentication components
│   └── ui/                 # UI components (theme toggle)
├── lib/
│   ├── graphLayout.ts      # Pre-computed stable positions
│   ├── fogOfWar.ts         # Visibility calculations
│   └── hooks/
│       └── useForceSimulation.ts  # Physics engine
├── types/                  # TypeScript type definitions
└── supabase/
    └── migrations/         # Database schema
```

## Architecture Highlights

### Camera State Machine
- **INITIALIZING:** Camera positioning on first mount
- **ANIMATING:** Camera animating to target (OrbitControls disabled)
- **USER_CONTROL:** User freely controls camera (OrbitControls enabled)

### Position Management
- **Pre-computed Layout:** 300 iterations of force simulation before render
- **Mutable Position Pattern:** GraphNode objects stored in refs, mutated by physics
- **useFrame Sync:** Visual positions updated every frame from mutable data

### Drag Implementation
- **Pointer Capture API:** Ensures smooth dragging even when cursor leaves node
- **Physics Pause:** Simulation pauses during drag to prevent conflicts
- **Real-time Edge Updates:** Edges track dragged node position every frame

## Deployment

### Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Connect to Vercel**
   - Import project from GitHub
   - Configure environment variables
   - Deploy

3. **Configure Supabase**
   - Update Site URL to Vercel deployment URL
   - Update Redirect URLs to include `/api/auth/callback`

### Manual Deployment

```bash
npm run build
npm start
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source and available under the MIT License.

## Acknowledgments

- **COTOAGA.AI** - The consciousness project
- **React Three Fiber** - Amazing React renderer for Three.js
- **Supabase** - Backend and authentication
- **Vercel** - Deployment platform

---

**Version:** 0.2.1 (Branding & UX Updates)
**Last Updated:** 2026-01-06
**Maintained by:** [@kydroon](https://github.com/kydroon)

🌐 **Production:** [https://be-part-of-net.vercel.app](https://be-part-of-net.vercel.app)
