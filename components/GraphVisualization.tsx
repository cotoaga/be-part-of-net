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
import { useTheme } from '@/lib/contexts/ThemeContext'
import {
  calculateHopDistancesBFS,
  getNodeVisibility,
  getEdgeVisibility,
  HopDistanceMap
} from '@/lib/fogOfWar'
import type { Node as GraphNode, Edge as GraphEdge, NodeType } from '@/types/graph'

interface GraphVisualizationProps {
  data?: {
    nodes: SimulationNode[]
    edges: { source: string; target: string }[]
  } | null
  isDemoMode?: boolean // If true, show Zaphod's Zoo
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

export default function GraphVisualization({ data, isDemoMode = false }: GraphVisualizationProps = {}) {
  // Try to get theme, but fallback to dark if ThemeProvider is not available (e.g., terminal routes)
  let theme = 'dark'
  try {
    const themeContext = useTheme()
    theme = themeContext.theme
  } catch {
    // ThemeProvider not available, use dark theme (terminal aesthetic)
  }

  const [nodes, setNodes] = useState<SimulationNode[]>([])
  const [edges, setEdges] = useState<{ source: string; target: string }[]>([])
  const [centeredNodeId, setCenteredNodeId] = useState<string | null>(null)
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null)
  const [hopDistances, setHopDistances] = useState<HopDistanceMap>({})
  const [loading, setLoading] = useState(true)

  // Camera animation state
  const [cameraTarget, setCameraTarget] = useState<[number, number, number]>([0, 0, 15])
  const [orbitTarget, setOrbitTarget] = useState<[number, number, number]>([0, 0, 0])

  // Theme-aware colors
  const backgroundColor = theme === 'light' ? '#FAFAFA' : '#0A0A0A'
  const accentColor = theme === 'light' ? '#00A86B' : '#0088FF' // Klein Bottle Green / Deep Space Blue
  const borderColor = theme === 'light' ? '#E5E7EB' : '#374151' // gray-200 / gray-700

  // Fetch data from Supabase OR use provided data
  useEffect(() => {
    // If data prop is provided (test mode), use it directly
    if (data) {
      setNodes(data.nodes)
      setEdges(data.edges)
      setLoading(false)
      // Set initial centered node (first node in demo)
      if (data.nodes.length > 0 && !centeredNodeId) {
        setCenteredNodeId(data.nodes[0].id)
      }
      return
    }

    // Otherwise, fetch from Supabase
    const fetchGraphData = async () => {
      const supabase = createClient()

      // Fetch nodes (filter by is_demo if in demo mode)
      const nodesQuery = supabase
        .from('nodes')
        .select('id, type, name, description, email, url, confirmed, is_demo')

      if (isDemoMode) {
        nodesQuery.eq('is_demo', true)
      } else {
        nodesQuery.eq('is_demo', false)
      }

      const { data: nodesData, error: nodesError } = await nodesQuery

      if (nodesError) {
        console.error('Error fetching nodes:', nodesError)
        setLoading(false)
        return
      }

      // Fetch edges (filter by is_demo if in demo mode)
      const edgesQuery = supabase
        .from('edges')
        .select('from_node_id, to_node_id')

      if (isDemoMode) {
        edgesQuery.eq('is_demo', true)
      } else {
        edgesQuery.eq('is_demo', false)
      }

      const { data: edgesData, error: edgesError } = await edgesQuery

      if (edgesError) {
        console.error('Error fetching edges:', edgesError)
        setLoading(false)
        return
      }

      // Build edge lookup (bidirectional for undirected graph visualization)
      const edgesByNode = new Map<string, string[]>()
      edgesData?.forEach((edge) => {
        if (!edgesByNode.has(edge.from_node_id)) {
          edgesByNode.set(edge.from_node_id, [])
        }
        if (!edgesByNode.has(edge.to_node_id)) {
          edgesByNode.set(edge.to_node_id, [])
        }
        edgesByNode.get(edge.from_node_id)!.push(edge.to_node_id)
        edgesByNode.get(edge.to_node_id)!.push(edge.from_node_id)
      })

      // Transform to graph nodes with random initial positions
      const graphNodes: SimulationNode[] = nodesData?.map((node) => ({
        id: node.id,
        name: node.name,
        description: node.description,
        type: node.type as NodeType,
        temperature: 5.0, // Default temperature for visualization
        position: [
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 10,
        ],
        velocity: [0, 0, 0],
        edges: edgesByNode.get(node.id) || [],
        confirmed: node.confirmed ?? true,
      })) || []

      const graphEdges = edgesData?.map((edge) => ({
        source: edge.from_node_id,
        target: edge.to_node_id,
      })) || []

      setNodes(graphNodes)
      setEdges(graphEdges)
      setLoading(false)

      // Set initial centered node in demo mode (Zaphod Beeblebrox)
      if (isDemoMode && graphNodes.length > 0 && !centeredNodeId) {
        // Find Zaphod node (hardcoded ID from seed data)
        const zaphodId = 'a1111111-1111-1111-1111-111111111111'
        const zaphodNode = graphNodes.find(n => n.id === zaphodId)
        setCenteredNodeId(zaphodNode ? zaphodId : graphNodes[0].id)
      }
    }

    fetchGraphData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, isDemoMode])

  // Run physics simulation
  const { nodes: simulatedNodes, toggleSimulation, isRunning } =
    useForceSimulation(nodes, edges.map(e => [e.source, e.target]))

  // Calculate hop distances when centered node changes
  useEffect(() => {
    if (centeredNodeId && edges.length > 0) {
      const allNodeIds = simulatedNodes.map(n => n.id)
      const distances = calculateHopDistancesBFS(
        centeredNodeId,
        edges.map(e => ({ from_node_id: e.source, to_node_id: e.target })),
        allNodeIds
      )
      setHopDistances(distances)
    }
  }, [centeredNodeId, edges, simulatedNodes])

  // Update camera when centered node changes
  useEffect(() => {
    if (centeredNodeId) {
      const node = simulatedNodes.find(n => n.id === centeredNodeId)
      if (node) {
        // Calculate camera position to maintain viewing angle
        const nodePos = new THREE.Vector3(...node.position)
        const currentCamPos = new THREE.Vector3(...cameraTarget)
        const direction = currentCamPos.clone().sub(new THREE.Vector3(...orbitTarget)).normalize()

        // Position camera at INITIAL_CAMERA_DISTANCE from centered node
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
  }, [centeredNodeId, simulatedNodes])

  // Handle node click with enforced traversal
  const handleNodeClick = (nodeId: string) => {
    const visibility = getNodeVisibility(nodeId, centeredNodeId, hopDistances)

    // Enforced traversal: can't click hop 4+ nodes
    if (!visibility.isClickable) {
      console.log('Node not clickable (hop distance too far)')
      return
    }

    console.log('Node clicked, setting as centered:', nodeId)
    setCenteredNodeId(nodeId)
  }

  // Handle background click - don't deselect in fog-of-war mode
  const handleBackgroundClick = () => {
    // In fog-of-war mode, keep centered node active
    console.log('Background clicked')
  }

  if (loading) {
    return (
      <div
        className="w-full h-[600px] flex items-center justify-center border rounded-lg"
        style={{ borderColor, backgroundColor }}
      >
        <div className="font-sans" style={{ color: accentColor }}>
          Loading network...
        </div>
      </div>
    )
  }

  if (nodes.length === 0) {
    return (
      <div
        className="w-full h-[600px] flex items-center justify-center border rounded-lg"
        style={{ borderColor, backgroundColor }}
      >
        <div className="font-sans text-center" style={{ color: accentColor }}>
          <p>Network Empty</p>
          <p className="text-sm mt-2 opacity-70">
            No nodes to display
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      className="w-full h-[600px] border relative rounded-lg"
      style={{ borderColor, backgroundColor }}
    >
      {/* Graph stats */}
      <div
        className="absolute top-4 left-4 z-10 font-sans text-sm space-y-2"
        style={{ color: accentColor }}
      >
        {/* Node counts by visibility */}
        <div className="space-y-1">
          <div>NODES (TOTAL): {nodes.length}</div>
          <div>
            NODES (CLOSE): {
              simulatedNodes.filter(n => {
                const vis = getNodeVisibility(n.id, centeredNodeId, hopDistances)
                return vis.opacity >= 0.5 && vis.isVisible
              }).length
            }
          </div>
          <div>
            NODES (FAR): {
              simulatedNodes.filter(n => {
                const vis = getNodeVisibility(n.id, centeredNodeId, hopDistances)
                return vis.opacity < 0.5 && vis.isVisible
              }).length
            }
          </div>
        </div>

        {/* Centered node info */}
        {centeredNodeId ? (
          <div
            className="mt-2 p-2 border rounded"
            style={{ borderColor: accentColor, backgroundColor }}
          >
            <div className="font-bold">CENTERED:</div>
            <div>{simulatedNodes.find(n => n.id === centeredNodeId)?.name}</div>
            {simulatedNodes.find(n => n.id === centeredNodeId)?.description && (
              <div className="text-xs mt-1 opacity-70">
                {simulatedNodes.find(n => n.id === centeredNodeId)?.description}
              </div>
            )}
          </div>
        ) : (
          <div
            className="mt-2 p-2 border rounded"
            style={{ borderColor: accentColor, backgroundColor }}
          >
            <div className="text-xs opacity-70">Center (not centered)</div>
          </div>
        )}
      </div>

      {/* 3D Canvas */}
      <Canvas
        style={{ background: backgroundColor }}
        onPointerMissed={handleBackgroundClick}
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

          {/* Render edges with fog-of-war */}
          {edges.map((edge, i) => {
            const sourceNode = simulatedNodes.find((n) => n.id === edge.source)
            const targetNode = simulatedNodes.find((n) => n.id === edge.target)

            if (!sourceNode || !targetNode) return null

            // Calculate edge visibility
            const edgeVis = getEdgeVisibility(
              edge.source,
              edge.target,
              centeredNodeId,
              hopDistances
            )

            if (!edgeVis.isVisible) return null

            return (
              <Edge3D
                key={`edge-${i}`}
                start={sourceNode.position}
                end={targetNode.position}
                color={accentColor}
                opacity={edgeVis.opacity}
              />
            )
          })}

          {/* Render nodes with fog-of-war */}
          {simulatedNodes.map((node) => {
            const visibility = getNodeVisibility(node.id, centeredNodeId, hopDistances)

            if (!visibility.isVisible) return null

            return (
              <Node3D
                key={node.id}
                id={node.id}
                name={node.name}
                position={node.position}
                temperature={node.temperature}
                edgeCount={node.edges.length}
                onClick={handleNodeClick}
                isCentered={visibility.isCentered}
                isSelected={visibility.isCentered}
                isClickable={visibility.isClickable}
                showLabel={visibility.showLabel}
                opacity={visibility.opacity}
                nodeType={node.type}
                confirmed={node.confirmed}
                accentColor={accentColor}
                backgroundColor={backgroundColor}
              />
            )
          })}
        </Suspense>
      </Canvas>
    </div>
  )
}
