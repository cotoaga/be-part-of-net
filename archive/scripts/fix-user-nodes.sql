-- Fix user nodes to have controlled_by set from auth users
-- This ensures the "+ Add Connection" button appears

-- First, let's see what needs fixing
SELECT
  n.id as node_id,
  n.name,
  n.email,
  n.controlled_by,
  u.id as user_id
FROM nodes n
LEFT JOIN auth.users u ON u.email = n.email
WHERE n.type = 'person'
  AND n.is_demo = false
  AND (n.controlled_by IS NULL OR n.controlled_by = '{}');

-- Fix: Update nodes to have controlled_by set to their auth user
UPDATE nodes n
SET controlled_by = ARRAY[u.id]
FROM auth.users u
WHERE n.email = u.email
  AND n.type = 'person'
  AND n.is_demo = false
  AND (n.controlled_by IS NULL OR n.controlled_by = '{}');

-- Verify the fix
SELECT
  n.id as node_id,
  n.name,
  n.email,
  n.controlled_by,
  u.id as user_id,
  CASE
    WHEN u.id = ANY(n.controlled_by) THEN '✅ FIXED'
    ELSE '❌ STILL BROKEN'
  END as status
FROM nodes n
LEFT JOIN auth.users u ON u.email = n.email
WHERE n.type = 'person'
  AND n.is_demo = false;
