-- Migration: Create new schema (users, nodes, edges) alongside legacy schema
-- Does NOT drop old consciousness_* tables yet - data migration happens next
--
-- Timeline:
--   008: Create new schema (this file)
--   009: Migrate data from consciousness_* to users/nodes/edges
--   010: Drop old schema (after verification)

-- ============================================
-- NEW SCHEMA: Users, Nodes, Edges
-- ============================================

-- Users table (separate from auth.users for app-specific data)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  email TEXT NOT NULL UNIQUE,
  is_admin BOOLEAN DEFAULT FALSE,
  temperature DECIMAL(4,1) DEFAULT 5.0, -- Account-level activity metric (0-10)
  last_login TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Nodes table (Person, App, MCP)
CREATE TABLE IF NOT EXISTS nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('person', 'app', 'mcp')),
  name TEXT NOT NULL,
  description TEXT,

  -- Person-specific fields
  email TEXT, -- For person nodes
  confirmed BOOLEAN DEFAULT TRUE, -- FALSE for invited-but-not-accepted persons

  -- Common fields
  url TEXT, -- Profile/website URL

  -- MCP-specific fields
  endpoint_url TEXT, -- MCP endpoint

  -- Ownership model: multiple users can control a node (personas)
  controlled_by UUID[] DEFAULT '{}', -- Array of user IDs

  -- Special flag for demo data
  is_demo BOOLEAN DEFAULT FALSE, -- TRUE for Zaphod's Zoo nodes

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Edges table (relations between nodes)
CREATE TABLE IF NOT EXISTS edges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_node_id UUID NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
  to_node_id UUID NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,

  -- Privacy model: label only visible to creator
  label TEXT DEFAULT '', -- User-defined relation tag (e.g., "collaborates-with", "built")
  created_by UUID, -- User ID who created this edge (NULL for demo data)

  -- Special flag for demo data
  is_demo BOOLEAN DEFAULT FALSE, -- TRUE for Zaphod's Zoo edges

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Prevent duplicate edges
  UNIQUE(from_node_id, to_node_id),

  -- Prevent self-loops
  CHECK (from_node_id != to_node_id)
);

-- ============================================
-- INDEXES for performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_nodes_type ON nodes(type);
CREATE INDEX IF NOT EXISTS idx_nodes_controlled_by ON nodes USING GIN(controlled_by);
CREATE INDEX IF NOT EXISTS idx_nodes_is_demo ON nodes(is_demo);
CREATE INDEX IF NOT EXISTS idx_edges_from_node ON edges(from_node_id);
CREATE INDEX IF NOT EXISTS idx_edges_to_node ON edges(to_node_id);
CREATE INDEX IF NOT EXISTS idx_edges_created_by ON edges(created_by);
CREATE INDEX IF NOT EXISTS idx_edges_is_demo ON edges(is_demo);

-- Partial unique index for demo node names
CREATE UNIQUE INDEX IF NOT EXISTS idx_nodes_demo_name_unique ON nodes(name) WHERE is_demo = TRUE;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE edges ENABLE ROW LEVEL SECURITY;

-- Users: Can read own record
DROP POLICY IF EXISTS "Users can read own record" ON users;
CREATE POLICY "Users can read own record"
  ON users FOR SELECT
  USING (auth.uid() = auth_user_id);

-- Users: Can update own record
DROP POLICY IF EXISTS "Users can update own record" ON users;
CREATE POLICY "Users can update own record"
  ON users FOR UPDATE
  USING (auth.uid() = auth_user_id);

-- Nodes: Anyone can read nodes (discovery mechanics)
DROP POLICY IF EXISTS "Anyone can read nodes" ON nodes;
CREATE POLICY "Anyone can read nodes"
  ON nodes FOR SELECT
  USING (TRUE);

-- Nodes: Users can insert nodes
DROP POLICY IF EXISTS "Authenticated users can insert nodes" ON nodes;
CREATE POLICY "Authenticated users can insert nodes"
  ON nodes FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Nodes: Users can update nodes they control
DROP POLICY IF EXISTS "Users can update nodes they control" ON nodes;
CREATE POLICY "Users can update nodes they control"
  ON nodes FOR UPDATE
  USING (auth.uid()::text = ANY(controlled_by::text[]));

-- Nodes: Users can delete nodes they control
DROP POLICY IF EXISTS "Users can delete nodes they control" ON nodes;
CREATE POLICY "Users can delete nodes they control"
  ON nodes FOR DELETE
  USING (auth.uid()::text = ANY(controlled_by::text[]));

-- Edges: Anyone can read edges (but label visibility handled in application layer)
DROP POLICY IF EXISTS "Anyone can read edges" ON edges;
CREATE POLICY "Anyone can read edges"
  ON edges FOR SELECT
  USING (TRUE);

-- Edges: Users can create edges
DROP POLICY IF EXISTS "Authenticated users can insert edges" ON edges;
CREATE POLICY "Authenticated users can insert edges"
  ON edges FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Edges: Users can update edges they created
DROP POLICY IF EXISTS "Users can update edges they created" ON edges;
CREATE POLICY "Users can update edges they created"
  ON edges FOR UPDATE
  USING (auth.uid()::text = created_by::text);

-- Edges: Users can delete edges they created
DROP POLICY IF EXISTS "Users can delete edges they created" ON edges;
CREATE POLICY "Users can delete edges they created"
  ON edges FOR DELETE
  USING (auth.uid()::text = created_by::text);

-- ============================================
-- FUNCTIONS for common operations
-- ============================================

-- Function: Get nodes controlled by a user
CREATE OR REPLACE FUNCTION get_user_nodes(user_id UUID)
RETURNS SETOF nodes AS $$
  SELECT * FROM nodes
  WHERE user_id::text = ANY(controlled_by::text[])
  ORDER BY created_at DESC;
$$ LANGUAGE SQL STABLE;

-- Function: Get hop distance from a source node (BFS)
CREATE OR REPLACE FUNCTION get_hop_distance(source_node_id UUID)
RETURNS TABLE(node_id UUID, hop_distance INTEGER) AS $$
WITH RECURSIVE hop_graph AS (
  -- Base case: source node at hop 0
  SELECT source_node_id AS node_id, 0 AS hop_distance

  UNION

  -- Recursive case: follow edges
  SELECT
    CASE
      WHEN e.from_node_id = hg.node_id THEN e.to_node_id
      ELSE e.from_node_id
    END AS node_id,
    hg.hop_distance + 1 AS hop_distance
  FROM hop_graph hg
  JOIN edges e ON (e.from_node_id = hg.node_id OR e.to_node_id = hg.node_id)
  WHERE hg.hop_distance < 6 -- Max 6 hops
)
SELECT DISTINCT ON (node_id) node_id, hop_distance
FROM hop_graph
ORDER BY node_id, hop_distance;
$$ LANGUAGE SQL STABLE;

-- ============================================
-- TRIGGERS for updated_at timestamps
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_nodes_updated_at ON nodes;
CREATE TRIGGER update_nodes_updated_at
  BEFORE UPDATE ON nodes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_edges_updated_at ON edges;
CREATE TRIGGER update_edges_updated_at
  BEFORE UPDATE ON edges
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- COMMENTS for documentation
-- ============================================

COMMENT ON TABLE users IS 'Application users with app-specific metadata';
COMMENT ON TABLE nodes IS 'Graph nodes: Person, App, or MCP entities';
COMMENT ON TABLE edges IS 'Directed edges between nodes with private labels';

COMMENT ON COLUMN nodes.controlled_by IS 'Array of user IDs who can edit this node (enables multiple personas per user)';
COMMENT ON COLUMN nodes.confirmed IS 'FALSE for person nodes created via invite that have not been claimed';
COMMENT ON COLUMN edges.label IS 'Private relation tag - only visible to creator (privacy model)';
COMMENT ON COLUMN edges.created_by IS 'User ID who created this edge - NULL for demo data';

COMMENT ON FUNCTION get_hop_distance IS 'Calculate BFS hop distance from a source node for fog-of-war mechanics';
