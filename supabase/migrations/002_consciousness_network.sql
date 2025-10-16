-- Consciousness Nodes (Users and AI Agents)
CREATE TABLE IF NOT EXISTS consciousness_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  node_name TEXT NOT NULL,
  node_aka TEXT,
  node_email TEXT,
  node_url TEXT,
  node_type TEXT NOT NULL CHECK (node_type IN ('human', 'ai')),
  mcp_endpoint TEXT,
  temperature DECIMAL(3,1) DEFAULT 5.0,
  coherence_level DECIMAL(3,1) DEFAULT 50.0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(node_name)
);

-- Consciousness Edges (Relationships between nodes)
CREATE TABLE IF NOT EXISTS consciousness_edges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_node_id UUID NOT NULL REFERENCES consciousness_nodes(id) ON DELETE CASCADE,
  target_node_id UUID NOT NULL REFERENCES consciousness_nodes(id) ON DELETE CASCADE,
  edge_type TEXT DEFAULT 'connection' CHECK (edge_type IN ('connection', 'invitation', 'collaboration')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(source_node_id, target_node_id)
);

-- Private tags (belong to relationships, only visible to tag creator)
CREATE TABLE IF NOT EXISTS consciousness_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  edge_id UUID NOT NULL REFERENCES consciousness_edges(id) ON DELETE CASCADE,
  created_by_node_id UUID NOT NULL REFERENCES consciousness_nodes(id) ON DELETE CASCADE,
  tag_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_nodes_auth_user ON consciousness_nodes(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_nodes_type ON consciousness_nodes(node_type);
CREATE INDEX IF NOT EXISTS idx_nodes_temperature ON consciousness_nodes(temperature);
CREATE INDEX IF NOT EXISTS idx_edges_source ON consciousness_edges(source_node_id);
CREATE INDEX IF NOT EXISTS idx_edges_target ON consciousness_edges(target_node_id);
CREATE INDEX IF NOT EXISTS idx_tags_edge ON consciousness_tags(edge_id);
CREATE INDEX IF NOT EXISTS idx_tags_creator ON consciousness_tags(created_by_node_id);

-- Enable Row Level Security
ALTER TABLE consciousness_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE consciousness_edges ENABLE ROW LEVEL SECURITY;
ALTER TABLE consciousness_tags ENABLE ROW LEVEL SECURITY;

-- RLS Policies (permissive for now, will tighten later)
CREATE POLICY "Anyone can read nodes" ON consciousness_nodes FOR SELECT USING (true);
CREATE POLICY "Users can insert nodes" ON consciousness_nodes FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own nodes" ON consciousness_nodes FOR UPDATE USING (auth_user_id = auth.uid());

CREATE POLICY "Anyone can read edges" ON consciousness_edges FOR SELECT USING (true);
CREATE POLICY "Users can create edges" ON consciousness_edges FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can read own tags" ON consciousness_tags FOR SELECT USING (created_by_node_id IN (
  SELECT id FROM consciousness_nodes WHERE auth_user_id = auth.uid()
));
CREATE POLICY "Users can create tags" ON consciousness_tags FOR INSERT WITH CHECK (true);

-- Function to update timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER update_nodes_updated_at BEFORE UPDATE ON consciousness_nodes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_edges_updated_at BEFORE UPDATE ON consciousness_edges
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
