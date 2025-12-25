/**
 * Type definitions for be-part-of.net graph data model
 */

// ============================================
// Database Types (matching Supabase schema)
// ============================================

export type NodeType = 'person' | 'app' | 'mcp';

export interface User {
  id: string;
  auth_user_id: string;
  email: string;
  is_admin: boolean;
  temperature: number; // 0-10 scale
  last_login: string; // ISO timestamp
  created_at: string;
  updated_at: string;
}

export interface Node {
  id: string;
  type: NodeType;
  name: string;
  description: string | null;

  // Person-specific
  email: string | null;
  confirmed: boolean;

  // Common
  url: string | null;

  // MCP-specific
  endpoint_url: string | null;

  // Ownership
  controlled_by: string[]; // User IDs

  // Special flags
  is_demo: boolean;
  is_global_service: boolean; // MCP nodes visible to all (exempt from fog-of-war)

  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface Edge {
  id: string;
  from_node_id: string;
  to_node_id: string;
  label: string; // Private to creator
  created_by: string | null; // User ID or null for demo
  is_demo: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================
// Graph Visualization Types
// ============================================

export interface GraphNode extends Node {
  // 3D position (calculated by force simulation)
  x: number;
  y: number;
  z: number;

  // Velocity (for physics)
  vx: number;
  vy: number;
  vz: number;

  // Visualization properties
  color: string;
  size: number;
  opacity: number;
  showLabel: boolean;
  isClickable: boolean;
  isCentered: boolean;
  hopDistance: number | null;
}

export interface GraphEdge extends Edge {
  // Source and target nodes (for quick lookup)
  source: GraphNode;
  target: GraphNode;

  // Visualization properties
  opacity: number;
  isVisible: boolean;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

// ============================================
// UI State Types
// ============================================

export interface CameraState {
  position: [number, number, number];
  target: [number, number, number];
  zoom: number;
  isAnimating: boolean;
}

export interface GraphInteractionState {
  centeredNodeId: string | null;
  selectedNodeId: string | null;
  hoveredNodeId: string | null;
  isSimulationPaused: boolean;
  cameraState: CameraState;
}

export interface NodeDetailCard {
  nodeId: string;
  isEditing: boolean;
  position: { x: number; y: number };
  isFlippedLeft: boolean;
  isFlippedUp: boolean;
}

// ============================================
// Connection Creation Flow Types
// ============================================

export type ConnectionFlowStep =
  | 'idle'
  | 'select-type'
  | 'create-person'
  | 'create-app'
  | 'create-mcp';

export interface ConnectionFormData {
  targetNodeType: NodeType | null;
  targetNodeId: string | null; // For existing node selection
  relationLabel: string;

  // Person creation
  personName?: string;
  personEmail?: string;

  // App creation
  appName?: string;
  appDescription?: string;
  appUrl?: string;

  // MCP creation
  mcpName?: string;
  mcpDescription?: string;
  mcpEndpoint?: string;
}

// ============================================
// API Response Types
// ============================================

export interface GraphFetchResponse {
  nodes: Node[];
  edges: Edge[];
  error?: string;
}

export interface HopDistanceResponse {
  node_id: string;
  hop_distance: number;
}

export interface CreateNodeResponse {
  node: Node;
  edge?: Edge; // Included if creating connection simultaneously
  error?: string;
}

export interface UpdateNodeResponse {
  node: Node;
  error?: string;
}

export interface DeleteNodeResponse {
  success: boolean;
  deleted_node_id: string;
  deleted_edge_ids: string[];
  error?: string;
}

// ============================================
// Utility Types
// ============================================

export interface NodeSearchResult {
  node: Node;
  matchScore: number; // For fuzzy search ranking
}

export interface GraphStats {
  totalNodes: number;
  totalEdges: number;
  nodesByType: Record<NodeType, number>;
  networkDepth: number; // Max hop distance
  userTemperature: number | null;
  userNodeIds: string[]; // Nodes controlled by current user
}

// ============================================
// Color Palette Types
// ============================================

export interface NodeColorPalette {
  person: string;
  app: string;
  mcp: string;
  unconfirmed: string; // For ghostly unconfirmed persons
}

export interface ThemeColors {
  background: string;
  text: {
    primary: string;
    secondary: string;
    muted: string;
  };
  node: NodeColorPalette;
  edge: {
    default: string;
    hover: string;
    selected: string;
  };
  saturnRing: {
    inner: string;
    outer: string;
  };
  ui: {
    cardBg: string;
    cardBorder: string;
    buttonPrimary: string;
    buttonSecondary: string;
    inputBorder: string;
    inputFocus: string;
  };
}
