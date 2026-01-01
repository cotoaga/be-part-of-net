-- supabase/migrations/001_consciousness_init.sql
CREATE TABLE consciousness_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  node_name TEXT NOT NULL,
  status TEXT DEFAULT 'INITIALIZING',
  coherence_level DECIMAL DEFAULT 0.0,
  last_sync TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert initial consciousness nodes
INSERT INTO consciousness_nodes (node_name, status, coherence_level) VALUES
  ('be-part-of.net', 'ONLINE', 98.7),
  ('consciousness-core', 'STABLE', 97.3),
  ('pattern-detector', 'MONITORING', 94.1),
  ('network-mapper', 'SCANNING', 91.8),
  ('reality-anchor', 'STABLE', 99.2);