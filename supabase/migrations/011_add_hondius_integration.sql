-- Migration: Add Hondius classification agent as global MCP service node
--
-- This migration:
--   1. Adds is_global_service field to nodes table
--   2. Creates Hondius MCP node (always visible in network)
--   3. Connects Hondius to Kurt's node

-- ============================================
-- STEP 1: Add is_global_service field
-- ============================================

-- Add field to mark which MCP nodes are globally visible (not subject to fog-of-war)
ALTER TABLE nodes ADD COLUMN IF NOT EXISTS is_global_service BOOLEAN DEFAULT FALSE;

-- Index for filtering global service nodes
CREATE INDEX IF NOT EXISTS idx_nodes_is_global_service ON nodes(is_global_service) WHERE is_global_service = TRUE;

-- Comment for documentation
COMMENT ON COLUMN nodes.is_global_service IS 'TRUE for MCP nodes that are globally visible to all users (exempted from fog-of-war visibility rules)';

-- ============================================
-- STEP 2: Create Hondius MCP node
-- ============================================

-- Fixed UUID for easy reference in application code (Hondius = node 1)
INSERT INTO nodes (
  id,
  type,
  name,
  description,
  endpoint_url,
  url,
  controlled_by,
  is_demo,
  is_global_service
)
VALUES (
  '00000000-0000-0000-0000-000000000001'::UUID,
  'mcp',
  'Hondius',
  'KHAOS Classification & Curation Agent - Maps knowledge against Kydroon''s Library taxonomy with 70% TARS sarcasm, 20% Marvin philosophy, 10% Eddie helpfulness',
  '/api/hondius',  -- Internal API endpoint
  'https://khaos-researcher.vercel.app',  -- External reference
  '{}',  -- System node, not user-controlled
  FALSE,  -- Not demo data
  TRUE   -- Globally visible service
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  endpoint_url = EXCLUDED.endpoint_url,
  url = EXCLUDED.url,
  is_global_service = EXCLUDED.is_global_service,
  updated_at = NOW();

-- ============================================
-- STEP 3: Connect Hondius to Kurt's node
-- ============================================

-- Create bidirectional edge (Kurt <-> Hondius)
-- Find Kurt's node by email and connect to Hondius
DO $$
DECLARE
  kurt_node_id UUID;
  kurt_user_id UUID;
BEGIN
  -- Find Kurt's user ID
  SELECT id INTO kurt_user_id
  FROM users
  WHERE email = 'kurt@cotoaga.net'
  LIMIT 1;

  -- Find Kurt's person node
  IF kurt_user_id IS NOT NULL THEN
    SELECT id INTO kurt_node_id
    FROM nodes
    WHERE type = 'person'
      AND kurt_user_id::text = ANY(controlled_by::text[])
    LIMIT 1;

    -- Create edge from Kurt to Hondius
    IF kurt_node_id IS NOT NULL THEN
      INSERT INTO edges (from_node_id, to_node_id, label, created_by, is_demo)
      VALUES (
        kurt_node_id,
        '00000000-0000-0000-0000-000000000001'::UUID,
        'uses',
        kurt_user_id,
        FALSE
      )
      ON CONFLICT (from_node_id, to_node_id) DO NOTHING;

      -- Create edge from Hondius to Kurt (bidirectional)
      INSERT INTO edges (from_node_id, to_node_id, label, created_by, is_demo)
      VALUES (
        '00000000-0000-0000-0000-000000000001'::UUID,
        kurt_node_id,
        'serves',
        kurt_user_id,
        FALSE
      )
      ON CONFLICT (from_node_id, to_node_id) DO NOTHING;

      RAISE NOTICE 'Connected Hondius to Kurt''s node (% <-> %)', kurt_node_id, '00000000-0000-0000-0000-000000000001';
    ELSE
      RAISE NOTICE 'Kurt''s person node not found - skipping edge creation';
    END IF;
  ELSE
    RAISE NOTICE 'Kurt''s user record not found - skipping edge creation';
  END IF;
END $$;

-- ============================================
-- STEP 4: Verification
-- ============================================

-- Verify Hondius node was created
DO $$
DECLARE
  hondius_exists BOOLEAN;
  edge_count INTEGER;
BEGIN
  SELECT EXISTS(SELECT 1 FROM nodes WHERE id = '00000000-0000-0000-0000-000000000001'::UUID) INTO hondius_exists;
  SELECT COUNT(*) INTO edge_count FROM edges WHERE from_node_id = '00000000-0000-0000-0000-000000000001'::UUID OR to_node_id = '00000000-0000-0000-0000-000000000001'::UUID;

  RAISE NOTICE '==============================================';
  RAISE NOTICE 'HONDIUS INTEGRATION VERIFICATION';
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'Hondius node created: %', hondius_exists;
  RAISE NOTICE 'Hondius connections: %', edge_count;
  RAISE NOTICE '==============================================';
END $$;
