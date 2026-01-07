-- Migration: Visitor Read-Only Permissions
-- Description: Adds RLS policies to prevent visitor@be-part-of.net from modifying data
-- Created: 2026-01-07

-- ==============================================================================
-- NODES TABLE: Visitor cannot INSERT, UPDATE, or DELETE
-- ==============================================================================

-- Policy: Visitor cannot INSERT nodes
CREATE POLICY "visitor_cannot_insert_nodes" ON nodes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT auth.email()) != 'visitor@be-part-of.net'
  );

-- Policy: Visitor cannot UPDATE nodes
CREATE POLICY "visitor_cannot_update_nodes" ON nodes
  FOR UPDATE
  TO authenticated
  USING (
    (SELECT auth.email()) != 'visitor@be-part-of.net'
  );

-- Policy: Visitor cannot DELETE nodes
CREATE POLICY "visitor_cannot_delete_nodes" ON nodes
  FOR DELETE
  TO authenticated
  USING (
    (SELECT auth.email()) != 'visitor@be-part-of.net'
  );

-- ==============================================================================
-- EDGES TABLE: Visitor cannot INSERT, UPDATE, or DELETE
-- ==============================================================================

-- Policy: Visitor cannot INSERT edges
CREATE POLICY "visitor_cannot_insert_edges" ON edges
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT auth.email()) != 'visitor@be-part-of.net'
  );

-- Policy: Visitor cannot UPDATE edges
CREATE POLICY "visitor_cannot_update_edges" ON edges
  FOR UPDATE
  TO authenticated
  USING (
    (SELECT auth.email()) != 'visitor@be-part-of.net'
  );

-- Policy: Visitor cannot DELETE edges
CREATE POLICY "visitor_cannot_delete_edges" ON edges
  FOR DELETE
  TO authenticated
  USING (
    (SELECT auth.email()) != 'visitor@be-part-of.net'
  );

-- ==============================================================================
-- NOTES
-- ==============================================================================
-- These policies enforce read-only access for the Visitor account at the database level.
-- The Visitor can still SELECT (read) all nodes and edges via existing policies.
-- UI-level restrictions should also be implemented for better UX.
