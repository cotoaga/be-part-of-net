# Database Migrations

This directory contains SQL migration files for be-part-of.net.

## Running Migrations

### Option 1: Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy the contents of the migration file (e.g., `001_fresh_start_schema.sql`)
5. Paste into the SQL Editor
6. Click **Run** (or press Cmd/Ctrl + Enter)

**⚠️ WARNING for destructive migrations:**
- `001_fresh_start_schema.sql` drops existing tables
- Make sure you have backups if needed
- Read the SQL carefully before running

### Option 2: Supabase CLI

If you have the Supabase CLI installed:

```bash
# Link your project (first time only)
supabase link --project-ref your-project-ref

# Run migration
supabase db push --file migrations/001_fresh_start_schema.sql
```

### Option 3: Direct PostgreSQL Connection

If you have direct database access:

```bash
psql "postgresql://[user]:[password]@[host]:[port]/[database]" < migrations/001_fresh_start_schema.sql
```

## Migration Files

### 001_fresh_start_schema.sql

**Purpose:** Fresh start for anti-social social network

**What it does:**
- Drops old `consciousness_*` tables (nodes, edges, tags)
- Creates new `users`, `nodes`, `edges` tables
- Sets up Row Level Security (RLS) policies
- Creates helper functions:
  - `get_user_nodes()` - Get all nodes controlled by a user
  - `get_hop_distance()` - Calculate BFS hop distance for fog-of-war
- Creates indexes for performance
- Sets up triggers for `updated_at` timestamps

**Key schema changes:**
- **Users:** Separate app-level user table (linked to `auth.users`)
- **Nodes:** Person/App/MCP types with `controlled_by` array (multi-persona support)
- **Edges:** Privacy-first with labels only visible to creator
- **Demo data:** `is_demo` flags for "Zaphod's Zoo" content

**After running:**
- All existing data will be deleted
- New empty schema will be ready
- Run seed script to populate demo data

## Seeding Demo Data

After running the migration, populate "Zaphod's Zoo" demo graph:

```bash
npm run migrate:seed
```

This will create 12 demo nodes and 18 demo edges for anonymous users to explore.

## Verification

After migration, verify in Supabase Dashboard:

1. **Table Editor** - Check tables exist: `users`, `nodes`, `edges`
2. **Database** → **Functions** - Verify `get_hop_distance()` and `get_user_nodes()` exist
3. **Authentication** → **Policies** - Check RLS policies are enabled

## Rollback

There is no automatic rollback. If you need to revert:

1. Restore from Supabase backup (Dashboard → Database → Backups)
2. Or manually recreate old schema (not recommended)

## Future Migrations

When creating new migrations:

1. Use sequential numbering: `002_add_feature.sql`, `003_another_feature.sql`
2. Include comments explaining what and why
3. Test on local/staging environment first
4. Document in this README

## Troubleshooting

**Error: "permission denied for schema public"**
- Make sure you're using the SQL Editor with proper permissions
- Check your database role has CREATE/DROP privileges

**Error: "function get_hop_distance already exists"**
- Migration was partially run
- Use `DROP FUNCTION IF EXISTS get_hop_distance CASCADE;` first

**Error: "relation does not exist"**
- Old tables weren't dropped successfully
- Manually drop them first: `DROP TABLE consciousness_nodes CASCADE;`

**RLS policies not working**
- Verify policies in Dashboard → Authentication → Policies
- Check `auth.uid()` is properly set in your Supabase client
- Test with `SELECT current_user;` in SQL Editor
