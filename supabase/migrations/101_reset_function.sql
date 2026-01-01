-- Function to reset network data (bypasses RLS)
-- This is needed because RLS policies prevent deleting person nodes and invited edges

CREATE OR REPLACE FUNCTION reset_network_data()
RETURNS JSON AS $$
DECLARE
  kurt_id UUID := '00000000-0000-0000-0000-000000000001';
  alice_id UUID := '00000000-0000-0000-0000-000000000002';
  bob_id UUID := '00000000-0000-0000-0000-000000000003';
  dave_id UUID := '00000000-0000-0000-0000-000000000004';
  carol_id UUID := '00000000-0000-0000-0000-000000000005';
  eddie_id UUID := '00000000-0000-0000-0000-000000000006';
  website_id UUID := '00000000-0000-0000-0000-000000000007';
BEGIN
  -- Delete all edges (CASCADE will handle any dependencies)
  DELETE FROM edges;

  -- Delete all nodes
  DELETE FROM nodes;

  -- Insert Kurt (ROOT - no invited_by)
  INSERT INTO nodes (id, type, name, email, description, invited_by, created_by)
  VALUES (kurt_id, 'person', 'Kurt', 'kurt@cotoaga.net', 'Root node, network origin', NULL, NULL);

  -- Insert other persons
  INSERT INTO nodes (id, type, name, email, description, invited_by, created_by)
  VALUES
    (alice_id, 'person', 'Alice', 'alice@example.com', 'Test node: Alice', kurt_id, NULL),
    (bob_id, 'person', 'Bob', 'bob@example.com', 'Test node: Bob', alice_id, NULL),
    (dave_id, 'person', 'Dave', 'dave@example.com', 'Test node: Dave', kurt_id, NULL),
    (carol_id, 'person', 'Carol', 'carol@example.com', 'Test node: Carol', dave_id, NULL),
    (eddie_id, 'person', 'Eddie', 'eddie@example.com', 'Test node: Eddie', kurt_id, NULL);

  -- Insert Bob's Website (URL)
  INSERT INTO nodes (id, type, name, url, description, created_by)
  VALUES (website_id, 'url', 'Bob''s Website', 'https://bob.example.com', 'Bob''s personal website', bob_id);

  -- Insert edges
  INSERT INTO edges (from_node_id, to_node_id, relation, created_by)
  VALUES
    (kurt_id, alice_id, 'invited', NULL),
    (kurt_id, dave_id, 'invited', NULL),
    (kurt_id, eddie_id, 'invited', NULL),
    (alice_id, bob_id, 'invited', NULL),
    (dave_id, carol_id, 'invited', NULL),
    (bob_id, website_id, 'created', NULL),
    (bob_id, carol_id, 'knowing', NULL);

  -- Return success with stats
  RETURN json_build_object(
    'success', true,
    'message', 'Test data created successfully',
    'stats', json_build_object(
      'nodes', 7,
      'edges', 7
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION reset_network_data() TO authenticated;

-- Add comment
COMMENT ON FUNCTION reset_network_data() IS 'Resets all network data and creates test data. Runs with elevated privileges to bypass RLS.';
