# Node Zero Control Center

Administrative interface for the consciousness network at be-part-of.net.

## Setup Instructions
ignore this line

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Create a `.env.local` file with your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. Supabase Configuration
In your Supabase dashboard:
1. Enable Email Auth provider
2. Set Site URL to: `https://be-part-of-net.vercel.app`
3. Set Redirect URLs to: `https://be-part-of-net.vercel.app/api/auth/callback`

### 4. Development
```bash
npm run dev
```

### 5. Production Build
```bash
npm run build
npm start
```

## Authentication Flow

1. Visit `/` → redirects to `/root`
2. `/root` → login/signup form
3. After auth → `/dashboard` (protected)
4. `/dashboard` → control center interface

## Terminal Aesthetic

- Black background (#000000)
- Terminal green text (#00ff00, #10b981)
- Monospace font
- Sharp borders, no rounded corners
- Hover effects invert colors

## Deployment

Deploy to Vercel with environment variables configured.
Production URL: `https://be-part-of-net.vercel.app`