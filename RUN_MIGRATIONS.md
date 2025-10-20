# Run Migrations - Quick Guide

Your Supabase Project: **rdxfxrnakweaydhloaev**

## Step 1: Open Supabase Dashboard

1. Go to: https://supabase.com/dashboard/project/rdxfxrnakweaydhloaev/sql/new
2. You should see the SQL Editor

## Step 2: Run Migration #1 (Schema)

**File:** `migrations/001_fresh_start_schema.sql`

1. Click **"New Query"** in the SQL Editor
2. Open the file `migrations/001_fresh_start_schema.sql` in your editor
3. Copy **all contents** (entire file)
4. Paste into the SQL Editor
5. Click **"Run"** (or press Cmd/Ctrl + Enter)
6. ✅ You should see "Success. No rows returned"

## Step 3: Run Migration #2 (Demo Data)

**File:** `migrations/002_seed_zaphodszoo.sql`

1. Click **"New Query"** again
2. Open the file `migrations/002_seed_zaphodszoo.sql` in your editor
3. Copy **all contents** (entire file)
4. Paste into the SQL Editor
5. Click **"Run"** (or press Cmd/Ctrl + Enter)
6. ✅ You should see success messages about creating nodes/edges

## Step 4: Verify Data

Run this query in the SQL Editor:

\`\`\`sql
-- Check demo nodes
SELECT type, COUNT(*) as count
FROM nodes
WHERE is_demo = TRUE
GROUP BY type;

-- Should show:
-- person: 5
-- app: 3
-- mcp: 4

-- Check demo edges
SELECT COUNT(*) as edge_count
FROM edges
WHERE is_demo = TRUE;

-- Should show: 18
\`\`\`

## Alternative: Use psql (If you have database password)

If you have your database password, I can also run the migrations via psql:

\`\`\`bash
# Set your password
export PGPASSWORD="your-database-password"

# Run migrations
psql "postgresql://postgres.rdxfxrnakweaydhloaev:[password]@aws-0-us-west-1.pooler.supabase.com:6543/postgres" < migrations/001_fresh_start_schema.sql

psql "postgresql://postgres.rdxfxrnakweaydhloaev:[password]@aws-0-us-west-1.pooler.supabase.com:6543/postgres" < migrations/002_seed_zaphodszoo.sql
\`\`\`

---

**After migrations complete, let me know and I'll help test the demo!**
