-- Migration: Migrate data from legacy consciousness_* schema to new users/nodes/edges schema
--
-- This migration:
--   1. Migrates consciousness_nodes → users + nodes
--   2. Migrates consciousness_edges → edges
--   3. Handles schema transformations (node_type mapping, etc.)

-- ============================================
-- STEP 1: Migrate consciousness_nodes → users table
-- ============================================

-- Create users from consciousness_nodes that have auth_user_id
INSERT INTO users (auth_user_id, email, is_admin, temperature, last_login, created_at, updated_at)
SELECT
  cn.auth_user_id,
  COALESCE(cn.node_email, au.email) AS email,
  COALESCE(cn.is_admin, FALSE) AS is_admin,
  COALESCE(cn.temperature, 5.0) AS temperature,
  COALESCE(cn.last_activity, cn.created_at) AS last_login,
  cn.created_at,
  cn.updated_at
FROM consciousness_nodes cn
LEFT JOIN auth.users au ON au.id = cn.auth_user_id
WHERE cn.auth_user_id IS NOT NULL
ON CONFLICT (auth_user_id) DO UPDATE SET
  email = EXCLUDED.email,
  is_admin = EXCLUDED.is_admin,
  temperature = EXCLUDED.temperature,
  last_login = EXCLUDED.last_login,
  updated_at = EXCLUDED.updated_at;

-- ============================================
-- STEP 2: Migrate consciousness_nodes → nodes table
-- ============================================

-- Create nodes from consciousness_nodes
-- Map node_type: 'human' → 'person', 'ai' → 'app'
INSERT INTO nodes (id, type, name, description, email, confirmed, url, endpoint_url, controlled_by, is_demo, created_at, updated_at)
SELECT
  cn.id,
  CASE
    WHEN cn.node_type = 'human' THEN 'person'
    WHEN cn.node_type = 'ai' THEN 'app'
    ELSE 'app' -- Default fallback
  END AS type,
  cn.node_name AS name,
  cn.node_aka AS description, -- Map node_aka to description
  cn.node_email AS email,
  TRUE AS confirmed, -- All existing nodes are confirmed
  cn.node_url AS url,
  cn.mcp_endpoint AS endpoint_url,
  -- If node has auth_user_id, add to controlled_by array; otherwise empty array
  CASE
    WHEN cn.auth_user_id IS NOT NULL THEN ARRAY[cn.auth_user_id]::UUID[]
    ELSE '{}'::UUID[]
  END AS controlled_by,
  FALSE AS is_demo, -- Existing data is not demo data
  cn.created_at,
  cn.updated_at
FROM consciousness_nodes cn
ON CONFLICT (id) DO UPDATE SET
  type = EXCLUDED.type,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  email = EXCLUDED.email,
  url = EXCLUDED.url,
  endpoint_url = EXCLUDED.endpoint_url,
  controlled_by = EXCLUDED.controlled_by,
  updated_at = EXCLUDED.updated_at;

-- ============================================
-- STEP 3: Migrate consciousness_edges → edges table
-- ============================================

-- Create edges from consciousness_edges
-- Map source_node_id → from_node_id, target_node_id → to_node_id
INSERT INTO edges (id, from_node_id, to_node_id, label, created_by, is_demo, created_at, updated_at)
SELECT
  ce.id,
  ce.source_node_id AS from_node_id,
  ce.target_node_id AS to_node_id,
  COALESCE(ce.edge_type, '') AS label, -- Map edge_type to label
  NULL AS created_by, -- We don't know who created legacy edges
  FALSE AS is_demo,
  ce.created_at,
  ce.updated_at
FROM consciousness_edges ce
-- Only migrate edges where both nodes exist in new nodes table
WHERE EXISTS (SELECT 1 FROM nodes WHERE id = ce.source_node_id)
  AND EXISTS (SELECT 1 FROM nodes WHERE id = ce.target_node_id)
ON CONFLICT (from_node_id, to_node_id) DO UPDATE SET
  label = EXCLUDED.label,
  updated_at = EXCLUDED.updated_at;

-- ============================================
-- STEP 4: Verification queries (informational)
-- ============================================

-- Log migration statistics
DO $$
DECLARE
  user_count INTEGER;
  node_count INTEGER;
  edge_count INTEGER;
  legacy_node_count INTEGER;
  legacy_edge_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO user_count FROM users;
  SELECT COUNT(*) INTO node_count FROM nodes;
  SELECT COUNT(*) INTO edge_count FROM edges;
  SELECT COUNT(*) INTO legacy_node_count FROM consciousness_nodes;
  SELECT COUNT(*) INTO legacy_edge_count FROM consciousness_edges;

  RAISE NOTICE '==============================================';
  RAISE NOTICE 'MIGRATION STATISTICS';
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'Legacy consciousness_nodes: %', legacy_node_count;
  RAISE NOTICE 'Legacy consciousness_edges: %', legacy_edge_count;
  RAISE NOTICE '----------------------------------------------';
  RAISE NOTICE 'New users: %', user_count;
  RAISE NOTICE 'New nodes: %', node_count;
  RAISE NOTICE 'New edges: %', edge_count;
  RAISE NOTICE '==============================================';
END $$;
