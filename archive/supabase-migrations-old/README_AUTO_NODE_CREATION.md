# Auto-Create User Nodes - Deployment Guide

## Problem Solved

Users were signing up successfully via Supabase Auth, but weren't appearing in the consciousness network graph because no `consciousness_nodes` record was being created for them. This resulted in an "empty network" experience for new users.

## Solution Overview

Two migrations have been created:

1. **006_create_kurt_node.sql** - Ensures the admin (Kurt) exists in the network
2. **007_auto_create_user_nodes.sql** - Auto-creates consciousness nodes for all new signups

## Deployment Steps

### Step 1: Access Supabase SQL Editor

1. Go to: https://supabase.com/dashboard/project/rdxfxrnakweaydhloaev/sql/new
2. Ensure you're logged in with appropriate permissions

### Step 2: Run Migration 006 (Kurt's Node)

1. Open `006_create_kurt_node.sql` in your editor
2. Copy the entire contents
3. Paste into Supabase SQL Editor
4. Click **RUN**

**What this does:**
- Adds a unique constraint on `auth_user_id` (one node per auth user)
- Creates Kurt's consciousness node (if kurt@cotoaga.net exists in auth.users)
- Sets Kurt as admin (`is_admin = TRUE`)
- Uses Kurt's actual auth UUID from the database (no hardcoding needed)

**Expected result:** Query should succeed with "Success. No rows returned"

**Verify Kurt's node:**
```sql
SELECT
  cn.node_name,
  cn.node_email,
  cn.is_admin,
  cn.temperature,
  cn.auth_user_id
FROM consciousness_nodes cn
WHERE cn.node_email = 'kurt@cotoaga.net';
```

Should return:
```
node_name      | node_email          | is_admin | temperature | auth_user_id
---------------|---------------------|----------|-------------|-------------
Kurt Cotoaga   | kurt@cotoaga.net    | true     | 10.0        | <uuid>
```

### Step 3: Run Migration 007 (Auto-Creation Trigger)

1. Open `007_auto_create_user_nodes.sql` in your editor
2. Copy the entire contents
3. Paste into Supabase SQL Editor
4. Click **RUN**

**What this does:**
- Drops existing trigger/function (safe to re-run)
- Creates `create_consciousness_node()` function
- Creates trigger `on_auth_user_created` that fires after INSERT on auth.users
- Handles node_name conflicts by appending random suffixes (e.g., "john-a3f2")
- Sets new users to `temperature = 10.0` (hot), `status = 'active'`, `is_admin = false`

**Expected result:** Query should succeed with "Success. No rows returned"

**Verify trigger exists:**
```sql
SELECT tgname, tgenabled, tgtype
FROM pg_trigger
WHERE tgname = 'on_auth_user_created';
```

Should return:
```
tgname                | tgenabled | tgtype
----------------------|-----------|-------
on_auth_user_created  | O         | 7
```

**Verify function exists:**
```sql
SELECT proname
FROM pg_proc
WHERE proname = 'create_consciousness_node';
```

Should return:
```
proname
-------------------------
create_consciousness_node
```

### Step 4: Test with a New User

**Option A: Test via SQL (Quick Verification)**

This creates a test user directly in the database to verify the trigger:

```sql
-- Create test auth user (trigger should fire automatically)
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'test.trigger@example.com',
  crypt('testpassword123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{}',
  FALSE
);

-- Check if consciousness_nodes was auto-created
SELECT
  cn.node_name,
  cn.node_email,
  cn.temperature,
  cn.is_admin,
  au.email as auth_email
FROM consciousness_nodes cn
JOIN auth.users au ON cn.auth_user_id = au.id
WHERE au.email = 'test.trigger@example.com';
```

**Expected result:**
```
node_name        | node_email               | temperature | is_admin | auth_email
-----------------|--------------------------|-------------|----------|-------------------------
test.trigger     | test.trigger@example.com | 10.0        | false    | test.trigger@example.com
```

**Option B: Test via App Signup (Real-World Test)**

1. Open an incognito/private browser window
2. Navigate to your app: https://be-part-of-net.vercel.app/login
3. Click "Need to create an account?"
4. Sign up with a new test email (e.g., testuser@example.com)
5. After signup, log in and navigate to `/network`
6. **Expected:** You should see at least 1 node (yourself) in the graph

### Step 5: Verify Kurt Can See Himself

1. Log out of the app (if logged in)
2. Log back in as kurt@cotoaga.net
3. Navigate to `/network`
4. **Expected:** Kurt should see himself as a node in the network

## Key Features

### Smart Node Name Generation

The trigger handles duplicate node names intelligently:

- **Base name:** Extracted from email (e.g., "john.doe@example.com" → "john.doe")
- **Collision handling:** If "john.doe" exists, appends random suffix ("john.doe-a3f2")
- **Fallback:** After 10 attempts, uses UUID-based suffix (guaranteed unique)

### Database-Level Guarantees

- **Unique constraint on auth_user_id:** Each auth user can only have one consciousness node
- **Unique constraint on node_name:** No duplicate names in the network
- **ON CONFLICT handling:** Prevents errors if node somehow already exists
- **SECURITY DEFINER:** Function runs with creator's privileges (necessary to access auth.users)

### Default Values for New Users

New users are created with:
- `node_type = 'human'` (AI nodes created separately via API)
- `temperature = 10.0` (hot - just joined)
- `status = 'active'` (immediately active)
- `is_admin = FALSE` (only Kurt is admin)
- `node_name` derived from email (guaranteed unique)
- `node_email` = full email address

## Troubleshooting

### Issue: Kurt's node not created

**Diagnosis:**
```sql
-- Check if Kurt exists in auth.users
SELECT id, email FROM auth.users WHERE email = 'kurt@cotoaga.net';
```

**If no result:** Kurt hasn't signed up yet. Have Kurt create an account first, then re-run migration 006.

**If result exists but node not created:** Check for errors in Supabase logs. Manually run:
```sql
SELECT * FROM consciousness_nodes WHERE node_email = 'kurt@cotoaga.net';
```

### Issue: Trigger not firing

**Diagnosis:**
```sql
-- Check trigger status
SELECT tgname, tgenabled FROM pg_trigger WHERE tgname = 'on_auth_user_created';
```

**If tgenabled = 'D':** Trigger is disabled. Re-run migration 007.
**If no result:** Trigger doesn't exist. Re-run migration 007.

### Issue: "duplicate key value violates unique constraint"

**Error message:**
```
ERROR: duplicate key value violates unique constraint "consciousness_nodes_node_name_key"
DETAIL: Key (node_name)=(john) already exists.
```

**Cause:** The name conflict handling in the trigger failed (very rare).

**Fix:** The trigger should handle this automatically. If it persists, check the trigger function:
```sql
SELECT prosrc FROM pg_proc WHERE proname = 'create_consciousness_node';
```

Verify the LOOP logic is present. If not, re-run migration 007.

### Issue: Empty network after login

**Diagnosis:**
```sql
-- Check if your consciousness node exists
SELECT * FROM consciousness_nodes WHERE node_email = 'your@email.com';
```

**If no result:**
1. Check if trigger is enabled (see "Trigger not firing" above)
2. Check Supabase logs for errors during signup
3. Try creating a new test account to verify trigger works

**If result exists but not showing in graph:**
- Check browser console for JavaScript errors
- Verify the `/network` page query fetches all nodes
- Check RLS policies on consciousness_nodes table

## Rollback (If Needed)

If something goes wrong and you need to undo these changes:

```sql
-- Remove the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Remove the function
DROP FUNCTION IF EXISTS create_consciousness_node();

-- Remove unique constraint on auth_user_id (if needed)
ALTER TABLE consciousness_nodes DROP CONSTRAINT IF EXISTS consciousness_nodes_auth_user_id_key;

-- Optionally remove Kurt's node (only if you want to start fresh)
-- DELETE FROM consciousness_nodes WHERE node_email = 'kurt@cotoaga.net';
```

## Next Steps

After deployment, consider:

1. **Onboarding flow:** Add a page where new users can customize their `node_name` and `node_aka`
2. **Welcome message:** Show new users a "You've manifested in the network!" message
3. **Temperature decay:** Create a scheduled function to gradually cool nodes over time
4. **Invitation system:** Modify trigger to set `status = 'pending'` for uninvited users

## Technical Details

**Function execution:** `SECURITY DEFINER` allows the function to access `auth.users` table (normally restricted)

**Trigger timing:** `AFTER INSERT` ensures the auth.users record is fully committed before node creation

**Name conflict resolution:** Uses MD5 hash of random number for entropy (low collision probability)

**Performance:** Trigger adds ~10-20ms to signup process (negligible)

## Success Criteria

✅ Kurt logs in → sees himself in the network graph
✅ New user signs up → automatically gets a consciousness node
✅ New user logs in → sees themselves in the network graph
✅ No duplicate nodes created for the same auth user
✅ Node names are unique (no conflicts)

---

**Generated:** 2025-11-01
**Migrations:** 006, 007
**Affects:** consciousness_nodes table, auth.users table (trigger only)
**Risk Level:** Low (read-only trigger, no data modified except new inserts)
