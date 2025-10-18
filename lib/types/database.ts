// Database types for consciousness network

export interface ConsciousnessNode {
  id: string
  auth_user_id: string | null
  node_name: string
  node_aka: string | null
  node_email: string | null
  node_url: string | null
  node_type: 'human' | 'ai'
  mcp_endpoint: string | null
  temperature: number
  coherence_level: number
  status: 'active' | 'inactive' | 'suspended'
  is_admin: boolean // Added in Phase 1
  created_at: string
  updated_at: string
  last_activity: string
}

export interface ConsciousnessEdge {
  id: string
  source_node_id: string
  target_node_id: string
  edge_type: 'connection' | 'invitation' | 'collaboration'
  created_at: string
  updated_at: string
}

export interface ConsciousnessTag {
  id: string
  edge_id: string
  created_by_node_id: string
  tag_text: string
  created_at: string
}

// Graph visualization types
export interface GraphNode extends ConsciousnessNode {
  position: [number, number, number]
  velocity?: [number, number, number]
  edges?: string[]
}

export interface GraphEdge {
  source: string
  target: string
  edge_type?: string
}
