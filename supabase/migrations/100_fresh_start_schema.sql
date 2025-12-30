-- Fresh start schema for be-part-of.net
-- Complete rebuild with simplified person/url/mcp model

-- Drop existing tables if they exist
DROP TABLE IF EXISTS edges CASCADE;
DROP TABLE IF EXISTS nodes CASCADE;

-- Nodes table: persons, URLs, MCPs
CREATE TABLE nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('person', 'url', 'mcp')),
  name TEXT NOT NULL,
  description TEXT,
  email TEXT,                      -- Person only
  url TEXT,                        -- URL/MCP only
  invited_by UUID REFERENCES nodes(id) ON DELETE SET NULL,  -- Person only, NULL = root
  created_by UUID REFERENCES nodes(id) ON DELETE SET NULL,  -- Who added this node
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Edges table: relations between nodes
CREATE TABLE edges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_node_id UUID NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
  to_node_id UUID NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
  relation TEXT NOT NULL CHECK (relation IN ('invited', 'knowing', 'working_with', 'created', 'using')),
  created_by UUID REFERENCES nodes(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(from_node_id, to_node_id, relation)
);

-- Indexes for performance
CREATE INDEX idx_nodes_type ON nodes(type);
CREATE INDEX idx_nodes_invited_by ON nodes(invited_by);
CREATE INDEX idx_nodes_created_by ON nodes(created_by);
CREATE INDEX idx_edges_from ON edges(from_node_id);
CREATE INDEX idx_edges_to ON edges(to_node_id);
CREATE INDEX idx_edges_relation ON edges(relation);
CREATE INDEX idx_edges_created_by ON edges(created_by);

-- Auto-update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for nodes updated_at
CREATE TRIGGER update_nodes_updated_at BEFORE UPDATE ON nodes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE edges ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Anyone can read (for now)
CREATE POLICY "Anyone can view nodes"
  ON nodes FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view edges"
  ON edges FOR SELECT
  USING (true);

-- RLS Policies: Authenticated users can insert
CREATE POLICY "Authenticated users can create nodes"
  ON nodes FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create edges"
  ON edges FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- RLS Policies: Users can update/delete nodes they created
CREATE POLICY "Users can update nodes they created"
  ON nodes FOR UPDATE
  USING (created_by = auth.uid()::uuid);

CREATE POLICY "Users can delete nodes they created"
  ON nodes FOR DELETE
  USING (created_by = auth.uid()::uuid AND type IN ('url', 'mcp'));

-- RLS Policies: Users can update/delete edges they created
CREATE POLICY "Users can update edges they created"
  ON edges FOR UPDATE
  USING (created_by = auth.uid()::uuid);

CREATE POLICY "Users can delete edges they created"
  ON edges FOR DELETE
  USING (created_by = auth.uid()::uuid AND relation != 'invited');

-- Helper function: Get hop distance from a node (for fog of war)
CREATE OR REPLACE FUNCTION get_hop_distance(source_node_id UUID)
RETURNS TABLE (node_id UUID, hop_distance INT) AS $$
WITH RECURSIVE node_hops AS (
  -- Base case: source node is hop 0
  SELECT
    source_node_id as node_id,
    0 as hop_distance,
    ARRAY[source_node_id] as visited_nodes

  UNION

  -- Recursive case: find connected nodes
  SELECT
    CASE
      WHEN e.from_node_id = nh.node_id THEN e.to_node_id
      ELSE e.from_node_id
    END as node_id,
    nh.hop_distance + 1 as hop_distance,
    nh.visited_nodes || CASE
      WHEN e.from_node_id = nh.node_id THEN e.to_node_id
      ELSE e.from_node_id
    END as visited_nodes
  FROM node_hops nh
  JOIN edges e ON e.from_node_id = nh.node_id OR e.to_node_id = nh.node_id
  WHERE nh.hop_distance < 4  -- Limit to 4 hops
  AND NOT (CASE
      WHEN e.from_node_id = nh.node_id THEN e.to_node_id
      ELSE e.from_node_id
    END = ANY(nh.visited_nodes))
)
SELECT DISTINCT node_id, MIN(hop_distance) as hop_distance
FROM node_hops
GROUP BY node_id;
$$ LANGUAGE SQL STABLE;
