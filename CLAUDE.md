# CLAUDE.md

AI Assistant Context Document for Node Zero Control Center

## Project Overview

**Node Zero Control Center** is a cyberpunk/Matrix-themed administrative interface for the "consciousness network" at be-part-of.net. It features a terminal aesthetic with Matrix rain animations and a mystical "Chaos Star" logo.

**Production URL:** https://be-part-of-net.vercel.app

## Tech Stack

- **Framework:** Next.js 14.2 (App Router)
- **Language:** TypeScript 5.6
- **UI Library:** React 18.3
- **Styling:** Tailwind CSS 3.4 (custom terminal theme)
- **Backend/Auth:** Supabase (SSR-enabled)
- **Testing:** Jest 30 + React Testing Library
- **Deployment:** Vercel
- **Package Manager:** npm

## Project Structure

```
be-part-of-net/
├── app/
│   ├── api/
│   │   ├── auth/callback/          # Supabase auth callback
│   │   └── consciousness/health/   # Health check endpoint
│   ├── dashboard/                  # Protected dashboard (main control center)
│   ├── matrix-test/                # Matrix rain testing page
│   ├── root/                       # Auth page (login/signup)
│   ├── layout.tsx                  # Root layout
│   ├── page.tsx                    # Home (redirects)
│   └── globals.css                 # Global styles + animations
├── components/
│   ├── MatrixRain.tsx              # Canvas-based Matrix background
│   └── AuthForm.tsx                # Login/signup form with Chaos Star
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

### Dashboard Page
- Server component with auth protection
- Matrix rain background
- Four info panels: Active Nodes, System Status, Pattern Detection, Network Nodes
- Sign-out server action

## Authentication Flow

1. `/` → redirects to `/root` (if unauthenticated) or `/dashboard` (if authenticated)
2. `/root` → login/signup form
3. After auth → redirect to `/dashboard`
4. Protected routes handled by `middleware.ts`

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

## Design Philosophy

This project embraces a **terminal hacker aesthetic** inspired by The Matrix and cyberpunk culture. Key principles:

1. **Minimalism:** Black backgrounds, green text, no unnecessary decoration
2. **Functionality:** Every element serves the "control center" narrative
3. **Immersion:** Matrix rain and Chaos Star reinforce the mystical/technical theme
4. **Accessibility:** High contrast, clear typography, keyboard-friendly forms

## Future Considerations

- Real-time data updates (Supabase subscriptions)
- More interactive dashboard controls
- Additional Matrix effects (glitch text, scanlines)
- Dark mode toggle (for non-terminal aesthetics)
- Internationalization support

---

**Last Updated:** 2025-10-06
**Project Version:** 0.1.0
**Maintained by:** kydroon
