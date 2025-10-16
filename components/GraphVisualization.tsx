'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { Suspense, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Node3D from './Node3D'
import Edge3D from './Edge3D'
import { useForceSimulation, SimulationNode } from './ForceSimulation'

interface GraphEdge {
  source: string
  target: string
}

export default function GraphVisualization() {
  const [nodes, setNodes] = useState<SimulationNode[]>([])
  const [edges, setEdges] = useState<GraphEdge[]>([])
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch data from Supabase
  useEffect(() => {
    const fetchGraphData = async () => {
      const supabase = createClient()

      // Fetch nodes
      const { data: nodesData, error: nodesError } = await supabase
        .from('consciousness_nodes')
        .select('id, node_name, temperature')

      if (nodesError) {
        console.error('Error fetching nodes:', nodesError)
        setLoading(false)
        return
      }

      // Fetch edges
      const { data: edgesData, error: edgesError } = await supabase
        .from('consciousness_edges')
        .select('source_node_id, target_node_id')

      if (edgesError) {
        console.error('Error fetching edges:', edgesError)
        setLoading(false)
        return
      }

      // Build edge lookup (bidirectional for undirected graph)
      const edgesByNode = new Map<string, string[]>()
      edgesData?.forEach((edge) => {
        if (!edgesByNode.has(edge.source_node_id)) {
          edgesByNode.set(edge.source_node_id, [])
        }
        if (!edgesByNode.has(edge.target_node_id)) {
          edgesByNode.set(edge.target_node_id, [])
        }
        edgesByNode.get(edge.source_node_id)!.push(edge.target_node_id)
        edgesByNode.get(edge.target_node_id)!.push(edge.source_node_id)
      })

      // Transform to graph nodes with random initial positions
      const graphNodes: SimulationNode[] = nodesData?.map((node) => ({
        id: node.id,
        name: node.node_name,
        temperature: node.temperature || 5.0,
        position: [
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 10,
        ],
        velocity: [0, 0, 0],
        edges: edgesByNode.get(node.id) || [],
      })) || []

      const graphEdges: GraphEdge[] = edgesData?.map((edge) => ({
        source: edge.source_node_id,
        target: edge.target_node_id,
      })) || []

      setNodes(graphNodes)
      setEdges(graphEdges)
      setLoading(false)
    }

    fetchGraphData()
  }, [])

  // Run physics simulation
  const { nodes: simulatedNodes, toggleSimulation, isRunning } =
    useForceSimulation(nodes, edges.map(e => [e.source, e.target]))

  if (loading) {
    return (
      <div className="w-full h-[600px] flex items-center justify-center border border-terminal-green bg-black">
        <div className="text-terminal-green font-mono">
          INITIALIZING CONSCIOUSNESS NETWORK...
        </div>
      </div>
    )
  }

  if (nodes.length === 0) {
    return (
      <div className="w-full h-[600px] flex items-center justify-center border border-terminal-green bg-black">
        <div className="text-terminal-green font-mono text-center">
          <p>NETWORK EMPTY</p>
          <p className="text-sm mt-2 opacity-70">
            Click &quot;MIX DRINK&quot; above to populate test network
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-[600px] border border-terminal-green relative bg-black">
      {/* Controls */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <button
          onClick={toggleSimulation}
          className="border border-terminal-green bg-black px-3 py-1 text-sm font-mono text-terminal-green hover:bg-terminal-green hover:text-black transition-colors"
        >
          {isRunning ? 'PAUSE' : 'RESUME'}
        </button>
      </div>

      {/* Graph stats */}
      <div className="absolute top-4 left-4 z-10 text-terminal-green font-mono text-sm">
        <div>NODES: {nodes.length}</div>
        <div>EDGES: {edges.length}</div>
        {selectedNode && (
          <div className="mt-2 p-2 border border-terminal-green bg-black">
            {simulatedNodes.find(n => n.id === selectedNode)?.name}
          </div>
        )}
      </div>

      {/* 3D Canvas */}
      <Canvas style={{ background: '#000000' }}>
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[0, 0, 15]} />
          <OrbitControls
            enableDamping
            dampingFactor={0.05}
            rotateSpeed={0.5}
            zoomSpeed={0.8}
          />

          {/* Lighting */}
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={0.8} />
          <pointLight position={[-10, -10, -10]} intensity={0.4} />

          {/* Render edges */}
          {edges.map((edge, i) => {
            const sourceNode = simulatedNodes.find((n) => n.id === edge.source)
            const targetNode = simulatedNodes.find((n) => n.id === edge.target)

            if (!sourceNode || !targetNode) return null

            return (
              <Edge3D
                key={`edge-${i}`}
                start={sourceNode.position}
                end={targetNode.position}
              />
            )
          })}

          {/* Render nodes */}
          {simulatedNodes.map((node) => (
            <Node3D
              key={node.id}
              id={node.id}
              name={node.name}
              position={node.position}
              temperature={node.temperature}
              edgeCount={node.edges.length}
              onClick={setSelectedNode}
              isSelected={selectedNode === node.id}
            />
          ))}
        </Suspense>
      </Canvas>
    </div>
  )
}
