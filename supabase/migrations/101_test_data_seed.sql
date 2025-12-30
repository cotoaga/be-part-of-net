-- Test data seed for be-part-of.net
-- Creates the network: Kurt → Alice → Bob, Kurt → Dave → Carol, Kurt → Eddie
-- Plus Bob's Website and connections

-- Clear existing test data (if any)
DELETE FROM edges WHERE created_by IS NULL OR created_by::text = 'test';
DELETE FROM nodes WHERE created_by IS NULL OR created_by::text = 'test';

-- Insert Kurt (ROOT - no invited_by)
INSERT INTO nodes (id, type, name, email, description, invited_by, created_by)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'person',
  'Kurt',
  'kurt@cotoaga.net',
  'Root node, network origin',
  NULL,  -- NULL = root
  NULL   -- Created by system/test
);

-- Insert Alice (invited by Kurt)
INSERT INTO nodes (id, type, name, email, description, invited_by, created_by)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  'person',
  'Alice',
  'alice@example.com',
  'First invitee',
  '00000000-0000-0000-0000-000000000001',
  NULL
);

-- Insert Bob (invited by Alice)
INSERT INTO nodes (id, type, name, email, description, invited_by, created_by)
VALUES (
  '00000000-0000-0000-0000-000000000003',
  'person',
  'Bob',
  'bob@example.com',
  'Alice''s invitee',
  '00000000-0000-0000-0000-000000000002',
  NULL
);

-- Insert Dave (invited by Kurt)
INSERT INTO nodes (id, type, name, email, description, invited_by, created_by)
VALUES (
  '00000000-0000-0000-0000-000000000004',
  'person',
  'Dave',
  'dave@example.com',
  'Kurt''s invitee',
  '00000000-0000-0000-0000-000000000001',
  NULL
);

-- Insert Carol (invited by Dave)
INSERT INTO nodes (id, type, name, email, description, invited_by, created_by)
VALUES (
  '00000000-0000-0000-0000-000000000005',
  'person',
  'Carol',
  'carol@example.com',
  'Dave''s invitee',
  '00000000-0000-0000-0000-000000000004',
  NULL
);

-- Insert Eddie (invited by Kurt)
INSERT INTO nodes (id, type, name, email, description, invited_by, created_by)
VALUES (
  '00000000-0000-0000-0000-000000000006',
  'person',
  'Eddie',
  'eddie@example.com',
  'Kurt''s invitee',
  '00000000-0000-0000-0000-000000000001',
  NULL
);

-- Insert Bob's Website (URL)
INSERT INTO nodes (id, type, name, url, description, invited_by, created_by)
VALUES (
  '00000000-0000-0000-0000-000000000007',
  'url',
  'Bob''s Website',
  'https://bob.example.com',
  'Bob''s personal website',
  NULL,
  '00000000-0000-0000-0000-000000000003'  -- Created by Bob
);

-- Insert edges: Invited relationships (implicit from invited_by, but explicit for graph)
INSERT INTO edges (from_node_id, to_node_id, relation, created_by) VALUES
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'invited', NULL),  -- Kurt → Alice
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000004', 'invited', NULL),  -- Kurt → Dave
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000006', 'invited', NULL),  -- Kurt → Eddie
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003', 'invited', NULL),  -- Alice → Bob
  ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000005', 'invited', NULL);  -- Dave → Carol

-- Insert edge: Bob created his website
INSERT INTO edges (from_node_id, to_node_id, relation, created_by) VALUES
  ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000007', 'created', '00000000-0000-0000-0000-000000000003');  -- Bob → Bob's Website

-- Insert edge: Bob and Carol knowing each other (bilateral relationship)
INSERT INTO edges (from_node_id, to_node_id, relation, created_by) VALUES
  ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000005', 'knowing', '00000000-0000-0000-0000-000000000003');  -- Bob → Carol

-- Note: For MVP, we're not requiring confirmation, so one-way "knowing" edge is enough
-- In future, Carol would need to confirm, creating the reverse edge
