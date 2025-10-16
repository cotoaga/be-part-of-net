'use client'

import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { Suspense, useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import Node3D from './Node3D'
import Edge3D from './Edge3D'
import { useForceSimulation, SimulationNode } from './ForceSimulation'
import * as THREE from 'three'
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib'

interface GraphEdge {
  source: string
  target: string
}

// Camera configuration constants
const INITIAL_CAMERA_DISTANCE = 15
const CAMERA_LERP_FACTOR = 0.05 // Smooth factor: lower = smoother but slower

// Camera animator component - smoothly transitions camera to target
function CameraAnimator({
  targetPosition,
  targetOrbit
}: {
  targetPosition: [number, number, number]
  targetOrbit: [number, number, number]
}) {
  const { camera } = useThree()
  const controlsRef = useRef<OrbitControlsImpl>(null)

  useFrame(() => {
    if (!controlsRef.current) return

    const controls = controlsRef.current

    // Smooth camera position transition
    camera.position.lerp(
      new THREE.Vector3(...targetPosition),
      CAMERA_LERP_FACTOR
    )

    // Smooth orbit target transition
    controls.target.lerp(
      new THREE.Vector3(...targetOrbit),
      CAMERA_LERP_FACTOR
    )

    controls.update()
  })

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.05}
      rotateSpeed={0.5}
      zoomSpeed={0.8}
      minDistance={5}
      maxDistance={50}
    />
  )
}

export default function GraphVisualization() {
  const [nodes, setNodes] = useState<SimulationNode[]>([])
  const [edges, setEdges] = useState<GraphEdge[]>([])
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Camera animation state
  const [cameraTarget, setCameraTarget] = useState<[number, number, number]>([0, 0, 15])
  const [orbitTarget, setOrbitTarget] = useState<[number, number, number]>([0, 0, 0])

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

  // Update camera when selected node changes
  useEffect(() => {
    if (selectedNode) {
      const node = simulatedNodes.find(n => n.id === selectedNode)
      if (node) {
        // Calculate camera position to maintain viewing angle
        const nodePos = new THREE.Vector3(...node.position)
        const currentCamPos = new THREE.Vector3(...cameraTarget)
        const direction = currentCamPos.clone().sub(new THREE.Vector3(...orbitTarget)).normalize()

        // Position camera at INITIAL_CAMERA_DISTANCE from selected node
        const newCameraPos = nodePos.clone().add(direction.multiplyScalar(INITIAL_CAMERA_DISTANCE))

        setCameraTarget([newCameraPos.x, newCameraPos.y, newCameraPos.z])
        setOrbitTarget(node.position)
      }
    } else {
      // Return to origin
      setCameraTarget([0, 0, 15])
      setOrbitTarget([0, 0, 0])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedNode, simulatedNodes])

  // Handle node selection
  const handleNodeSelect = (nodeId: string) => {
    setSelectedNode(nodeId)
  }

  // Handle background click to deselect
  const handleBackgroundClick = () => {
    if (selectedNode) {
      setSelectedNode(null)
    }
  }

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
      <Canvas
        style={{ background: '#000000' }}
        onClick={handleBackgroundClick}
      >
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[0, 0, 15]} />
          <CameraAnimator
            targetPosition={cameraTarget}
            targetOrbit={orbitTarget}
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
              onClick={handleNodeSelect}
              isSelected={selectedNode === node.id}
            />
          ))}
        </Suspense>
      </Canvas>
    </div>
  )
}
