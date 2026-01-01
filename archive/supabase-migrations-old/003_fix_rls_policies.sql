-- Fix RLS policies for test mode
-- Run this in Supabase SQL Editor if you're getting permission errors

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can insert nodes" ON consciousness_nodes;
DROP POLICY IF EXISTS "Users can update own nodes" ON consciousness_nodes;

-- Create more permissive policies for testing
CREATE POLICY "Authenticated users can insert nodes"
  ON consciousness_nodes
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update nodes"
  ON consciousness_nodes
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Also allow deletion for testing/reset
DROP POLICY IF EXISTS "Users can delete nodes" ON consciousness_nodes;
CREATE POLICY "Authenticated users can delete nodes"
  ON consciousness_nodes
  FOR DELETE
  TO authenticated
  USING (true);

-- Same for edges
DROP POLICY IF EXISTS "Users can create edges" ON consciousness_edges;
CREATE POLICY "Authenticated users can insert edges"
  ON consciousness_edges
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can delete edges" ON consciousness_edges;
CREATE POLICY "Authenticated users can delete edges"
  ON consciousness_edges
  FOR DELETE
  TO authenticated
  USING (true);

-- Verify policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename IN ('consciousness_nodes', 'consciousness_edges', 'consciousness_tags')
ORDER BY tablename, policyname;
