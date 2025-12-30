# Database Schema Migration Guide
## From Legacy Consciousness Schema to New Users/Nodes/Edges Schema

**Status:** Ready to execute
**Date:** 2025-11-17
**Migrated By:** Claude Code (with kydroon)

---

## Executive Summary

This migration transitions the database from the **legacy "consciousness" schema** to the **new "users/nodes/edges" schema**. All application code has been updated to use the new schema.

### What Changed

| Aspect | OLD (Legacy) | NEW (Current) |
|--------|--------------|---------------|
| **Tables** | `consciousness_nodes`, `consciousness_edges`, `consciousness_tags` | `users`, `nodes`, `edges` |
| **Node Types** | `human \| ai` | `person \| app \| mcp` |
| **Ownership** | Single `auth_user_id` | Array `controlled_by[]` |
| **Admin Field** | On nodes table | On users table |
| **Demo Data** | Mixed with real | Flagged with `is_demo` |
| **Edge Labels** | Separate `edge_type` | Embedded `label` field |

---

## Migration Files

Three new migrations have been created in `/supabase/migrations/`:

1. **008_create_new_schema.sql** - Creates new tables alongside legacy
2. **009_migrate_data.sql** - Migrates data from old → new
3. **010_update_auto_create_trigger.sql** - Updates auth trigger for new schema

**Rollback available:** `ROLLBACK_new_schema.sql` (safety script)

---

## Pre-Migration Checklist

Before running the migration, verify:

- [ ] **Backup database** - Create a snapshot via Supabase dashboard
- [ ] **All code deployed** - Ensure latest code is on production
- [ ] **Environment stable** - No active deployments or maintenance
- [ ] **Admin access confirmed** - You have admin access to run test endpoints
- [ ] **Users notified** (if applicable) - Brief downtime warning

---

## Migration Steps

### Step 1: Run Migrations (Supabase CLI or Dashboard)

**Option A: Using Supabase CLI (Recommended)**

```bash
# Navigate to project root
cd /Users/kydroon/Development/be-part-of-net

# Push migrations to database
npx supabase db push

# Verify migrations applied
npx supabase migration list
```

**Option B: Using Supabase Dashboard**

1. Go to Supabase Dashboard → SQL Editor
2. Run each migration file in order:
   - `008_create_new_schema.sql`
   - `009_migrate_data.sql`
   - `010_update_auto_create_trigger.sql`
3. Check for errors in the output

### Step 2: Verify Migration

After running migrations, verify the data:

```sql
-- Check that tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('users', 'nodes', 'edges');

-- Check record counts
SELECT
  (SELECT COUNT(*) FROM users) as users_count,
  (SELECT COUNT(*) FROM nodes) as nodes_count,
  (SELECT COUNT(*) FROM edges) as edges_count,
  (SELECT COUNT(*) FROM consciousness_nodes) as legacy_nodes_count,
  (SELECT COUNT(*) FROM consciousness_edges) as legacy_edges_count;

-- Verify trigger exists
SELECT tgname FROM pg_trigger WHERE tgname = 'on_auth_user_created';
```

**Expected Results:**
- `users_count` = number of users with auth_user_id
- `nodes_count` = same as `legacy_nodes_count`
- `edges_count` = same as `legacy_edges_count`
- Trigger name = `on_auth_user_created`

### Step 3: Test Application

**Test these critical flows:**

1. **Sign up new user**
   - Create a new account
   - Verify user appears in `users` table
   - Verify person node created in `nodes` table

2. **Admin access to /node-zero**
   - Log in as admin
   - Navigate to `/node-zero`
   - Verify access granted (not redirected)

3. **Test data population**
   - Click "MIX DRINK" button on `/node-zero`
   - Verify Zaphod's Zoo appears in visualization
   - Check demo nodes have `is_demo = true`

4. **Network reset**
   - Click "RESET NETWORK" on `/node-zero`
   - Confirm deletion
   - Verify all nodes/edges cleared

5. **User network page**
   - Navigate to `/network`
   - Verify user name displays correctly
   - Verify graph loads (even if empty)

### Step 4: Monitor for Errors

Check application logs for:
- Database query errors
- Authentication issues
- Graph visualization failures

### Step 5: (Optional) Drop Legacy Tables

⚠️ **ONLY after confirming everything works for 24-48 hours**

```sql
-- DANGER: This is irreversible (unless you have backups)
DROP TABLE IF EXISTS consciousness_tags CASCADE;
DROP TABLE IF EXISTS consciousness_edges CASCADE;
DROP TABLE IF EXISTS consciousness_nodes CASCADE;
```

---

## Rollback Procedure

If migration fails or critical bugs appear:

### Step 1: Run Rollback Script

```sql
-- Execute via Supabase Dashboard SQL Editor
-- File: supabase/migrations/ROLLBACK_new_schema.sql
```

This will:
- Drop new tables (`users`, `nodes`, `edges`)
- Restore legacy trigger
- Clean up new functions

### Step 2: Revert Application Code

```bash
# Revert to commit before migration
git revert HEAD~8  # Adjust number based on commits

# Or manually revert files:
git checkout HEAD~8 -- middleware.ts
git checkout HEAD~8 -- app/network/page.tsx
git checkout HEAD~8 -- app/api/test/pan-galactic/route.ts
git checkout HEAD~8 -- app/api/test/reset/route.ts
```

### Step 3: Deploy Reverted Code

Deploy the reverted code to production immediately.

---

## Code Changes Summary

### Files Modified

1. **middleware.ts** (line 82-86)
   - Changed from `consciousness_nodes` → `users`
   - Now checks `users.is_admin` field
   - Protected `/api/test/*` routes

2. **app/network/page.tsx** (line 37-43)
   - Changed from `consciousness_nodes` → `nodes`
   - Query uses `controlled_by` array instead of `auth_user_id`
   - Field `node_name` → `name`

3. **app/api/test/pan-galactic/route.ts** (entire file)
   - Test data reformatted for new schema
   - `node_type: 'human'` → `type: 'person'`
   - `node_type: 'ai'` → `type: 'app'`
   - Added `is_demo: true` flag
   - Changed tables: `consciousness_nodes` → `nodes`, `consciousness_edges` → `edges`

4. **app/api/test/reset/route.ts** (line 18-50)
   - Changed tables: `consciousness_nodes` → `nodes`, `consciousness_edges` → `edges`
   - Added `users` table deletion

5. **lib/types/database.ts** (DELETED)
   - Removed legacy type definitions
   - Now using `types/graph.ts` exclusively

---

## Schema Comparison

### OLD: consciousness_nodes

```sql
CREATE TABLE consciousness_nodes (
  auth_user_id UUID,           -- Single owner
  node_name TEXT,              -- Node name
  node_aka TEXT,               -- Alias
  node_type TEXT,              -- 'human' | 'ai'
  is_admin BOOLEAN,            -- Admin flag on nodes
  temperature DECIMAL,
  coherence_level DECIMAL,     -- Removed in new schema
  status TEXT,                 -- Removed in new schema
  ...
);
```

### NEW: users + nodes

```sql
CREATE TABLE users (
  auth_user_id UUID UNIQUE,
  email TEXT,
  is_admin BOOLEAN,            -- Admin flag on users
  temperature DECIMAL,
  ...
);

CREATE TABLE nodes (
  type TEXT,                   -- 'person' | 'app' | 'mcp'
  name TEXT,                   -- Node name
  description TEXT,            -- Replaces node_aka
  controlled_by UUID[],        -- Array of owners
  is_demo BOOLEAN,             -- Demo data flag
  confirmed BOOLEAN,           -- Invite system
  endpoint_url TEXT,           -- MCP endpoint
  ...
);
```

---

## FAQ

### Q: Will existing users lose access?

**A:** No. The migration preserves all user data and creates corresponding records in the new schema.

### Q: What happens to existing demo data?

**A:** Demo data gets `is_demo = true` flag. Use `/api/test/reset` to clear it.

### Q: Can I run migrations multiple times?

**A:** Yes. Migrations 008 uses `IF NOT EXISTS`, and 009 uses `ON CONFLICT` clauses for idempotency.

### Q: What if I have custom nodes/edges?

**A:** Migration 009 migrates ALL data. Custom data is preserved with `is_demo = false`.

### Q: Why keep legacy tables?

**A:** Safety. Drop them only after 24-48 hours of stable operation.

### Q: How do I make a user admin?

```sql
UPDATE users SET is_admin = true WHERE email = 'your-email@example.com';
```

---

## Post-Migration Tasks

- [ ] Update CLAUDE.md to remove "schema migration in progress" warnings
- [ ] Update README if schema is documented there
- [ ] Consider adding migration 011 to drop legacy tables (after testing period)
- [ ] Monitor Sentry/logs for 48 hours
- [ ] Announce successful migration to team (if applicable)

---

## Support

If you encounter issues:

1. Check Supabase logs for database errors
2. Check application logs for query errors
3. Use rollback script if critical
4. Review this guide's troubleshooting section

---

**Migration prepared by:** Claude Code
**Migration reviewed by:** kydroon
**Status:** ✅ Ready to execute
