-- Migration: Collaboration System Redesign
-- Date: 2026-01-06
-- Description: Replace "using" and "working_with" with unified "collaborates_on" relation
--              Establish clear edge hierarchy and permanence rules

BEGIN;

-- Step 1: Migrate existing "using" edges to "collaborates_on" FIRST (before constraint change)
UPDATE edges
SET relation = 'collaborates_on'
WHERE relation = 'using';

-- Step 2: Delete all "working_with" edges (deprecated person-to-person collaboration)
DELETE FROM edges WHERE relation = 'working_with';

-- Step 3: Now update the constraint (after data is migrated)
ALTER TABLE edges DROP CONSTRAINT IF EXISTS edges_relation_check;
ALTER TABLE edges ADD CONSTRAINT edges_relation_check
  CHECK (relation IN ('invited', 'knowing', 'created', 'collaborates_on'));

-- Step 4: Add "collaborates_on" edges for existing creators (dual-edge pattern)
-- For every 'created' edge, add a corresponding 'collaborates_on' edge
-- This ensures creators are also collaborators
INSERT INTO edges (from_node_id, to_node_id, relation, created_by)
SELECT
  from_node_id,
  to_node_id,
  'collaborates_on' AS relation,
  created_by
FROM edges
WHERE relation = 'created'
ON CONFLICT (from_node_id, to_node_id, relation) DO NOTHING;

-- Step 5: Update RLS deletion policy to prevent deleting "created" edges
-- Drop old policy
DROP POLICY IF EXISTS "Users can delete edges they created" ON edges;

-- Create new policy that prevents deletion of both "invited" and "created" edges
CREATE POLICY "Users can delete edges they created"
  ON edges FOR DELETE
  USING (
    created_by = auth.uid()::uuid
    AND relation NOT IN ('invited', 'created')
  );

COMMIT;
