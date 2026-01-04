// Type definitions for be-part-of.net

export type NodeType = 'person' | 'url' | 'mcp';

export type RelationType = 'invited' | 'knowing' | 'working_with' | 'created' | 'using';

export interface Node {
  id: string;
  type: NodeType;
  name: string;
  description: string | null;
  email: string | null;          // Person only
  url: string | null;             // URL/MCP only
  invited_by: string | null;      // Person only, NULL = root
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Edge {
  id: string;
  from_node_id: string;
  to_node_id: string;
  relation: RelationType;
  created_by: string | null;
  created_at: string;
}

export interface GraphNode extends Node {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  edges: GraphEdge[];
}

export interface GraphEdge extends Edge {
  source: GraphNode;
  target: GraphNode;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface User {
  id: string;
  email: string;
  nodeId: string | null;
}

// Interaction mode for graph interactions (Phase 2)
export enum InteractionMode {
  IDLE = 'idle',
  CONNECT_SELECT = 'connect_select',
  CONNECT_TARGET = 'connect_target',
}

// Panel types for single-panel state machine (Phase 2)
export enum PanelType {
  NONE = 'none',
  INSPECTOR = 'inspector',
  INVITE = 'invite',
  CREATE = 'create',
  USE = 'use',
  CONNECT = 'connect',
  EDIT = 'edit',
}
