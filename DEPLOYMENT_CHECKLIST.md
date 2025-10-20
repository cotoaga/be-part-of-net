# Deployment Checklist - Phase 1

## ✅ Build Status

- [x] TypeScript compilation passes (`npm run type-check`)
- [x] Production build succeeds (`npm run build`)
- [x] No linting errors
- [x] All new components created
- [x] Migration scripts ready

## 🔧 Pre-Deployment Steps

### 1. Database Setup

**Supabase Dashboard:**
1. Navigate to SQL Editor
2. Run migration #1: `migrations/001_fresh_start_schema.sql`
   - Creates new tables (users, nodes, edges)
   - Sets up RLS policies
   - Creates helper functions
3. Run migration #2: `migrations/002_seed_zaphodszoo.sql`
   - Populates Zaphod's Zoo demo data
   - 12 nodes, 18 edges

**Verify:**
```sql
-- Should return 12
SELECT COUNT(*) FROM nodes WHERE is_demo = TRUE;

-- Should return 18
SELECT COUNT(*) FROM edges WHERE is_demo = TRUE;

-- Should show 5 person, 3 app, 4 mcp
SELECT type, COUNT(*) FROM nodes WHERE is_demo = TRUE GROUP BY type;
```

### 2. Environment Variables

**Local (.env.local):**
```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**Vercel (Production):**
- Go to Vercel dashboard → Your project → Settings → Environment Variables
- Add the same variables as above
- Redeploy if already deployed

### 3. Test Locally

```bash
# Start dev server
npm run dev

# Open browser
open http://localhost:3000
```

**Expected:**
- Zaphod's Zoo graph loads immediately
- 12 nodes visible (from Zaphod's perspective)
- Saturn ring animates around centered node
- Clicking nodes recenters and updates fog-of-war
- "Sign In" button in top-right

## 🚀 Deployment Steps

### Option 1: Vercel (Recommended)

```bash
# If not already connected
vercel link

# Deploy to production
vercel --prod
```

### Option 2: Git Push (if connected to Vercel)

```bash
git add .
git commit -m "feat: Phase 1 - Fog-of-war demo with Zaphod's Zoo"
git push origin main
```

Vercel will auto-deploy from main branch.

## 🧪 Post-Deployment Testing

Visit your production URL and verify:

- [ ] Homepage loads without errors
- [ ] Graph visualization renders
- [ ] Zaphod Beeblebrox is centered with Saturn ring
- [ ] Nodes have correct colors (blue=person, orange=app, purple=mcp)
- [ ] Clicking nodes recenters the graph
- [ ] Fog-of-war opacity works (some nodes ghostly/invisible)
- [ ] Stats show "NODES: 12, EDGES: 18"
- [ ] "Sign In" button is visible
- [ ] No console errors in browser DevTools
- [ ] Matrix rain still works on `/root` route (terminal aesthetic preserved)

## 📊 Key Routes

| Route | Status | Description |
|-------|--------|-------------|
| `/` | ✅ Updated | Demo mode with Zaphod's Zoo |
| `/root` | ✅ Preserved | Matrix terminal auth (unchanged) |
| `/node-zero` | ⚠️ Needs Update | Admin route (will need fog-of-war integration) |
| `/network` | ⚠️ Needs Update | User network (will fetch real user data) |
| `/login` | ✅ Preserved | Login route (unchanged) |

## 🐛 Known Issues / Limitations

### Expected Behavior (Not Bugs)
- Edge labels are visible in demo (privacy enforcement not needed for demo data)
- All demo nodes are "confirmed" (no ghost person nodes yet)
- Cannot create/edit nodes (CRUD UI not built yet)
- No user network (only Zaphod's Zoo demo works)

### Potential Issues to Watch
- **Performance with large graphs**: Demo has 12 nodes, real networks may need optimization
- **Mobile touch interactions**: May need touch-specific controls
- **Browser compatibility**: Tested in modern Chrome/Firefox, may need Safari testing

## 📝 Next Phase (Phase 2)

After deployment, these features are ready to build:

1. **Floating Node Detail Card**
   - View mode for centered node
   - Edit mode for owned nodes
   - Relation list (inbound/outbound)

2. **User Network View**
   - Fetch user's own nodes/edges
   - Create first node flow
   - Empty state handling

3. **Visual Design System**
   - Define color palette (beyond Matrix green)
   - Typography system
   - Card/button styles

4. **Connection Creation**
   - Add Connection modal
   - Person/App/MCP type selection
   - Search existing nodes

5. **Admin Toggle**
   - Switch between "Your Network" ↔ "Zaphod's Zoo"
   - Only visible to admin users

## 🆘 Rollback Plan

If deployment fails or critical bugs found:

1. **Vercel:** Rollback to previous deployment in dashboard
2. **Database:** Restore from Supabase backup
3. **Code:** `git revert` to previous working commit

## 📞 Support

- **Build errors:** Check `npm run type-check` locally first
- **Graph not loading:** Verify Supabase connection and data
- **Missing nodes:** Run seed migration again
- **Styling issues:** Check theme toggle, may need to clear browser cache

---

**Deployment Status:** Ready for testing ✅
**Migration Status:** Pending (run SQL scripts in Supabase)
**Production Build:** Passing ✅
