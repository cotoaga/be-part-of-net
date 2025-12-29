'use client'

import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { Suspense, useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import Node3D from './Node3D'
import Edge3D from './Edge3D'
import InspectPanel from './InspectPanel'
import AddConnectionModal, { type ConnectionFormData } from './AddConnectionModal'
import ThemeToggle from './ThemeToggle'
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
  onSignOut?: () => void
  userName?: string
}

// Camera configuration constants
const INITIAL_CAMERA_DISTANCE = 15
const CAMERA_LERP_FACTOR = 0.05 // Smooth factor: lower = smoother but slower

// Camera animator component - smoothly transitions camera to target
function CameraAnimator({
  targetPosition,
  targetOrbit,
  enableAutoCenter
}: {
  targetPosition: [number, number, number]
  targetOrbit: [number, number, number]
  enableAutoCenter: boolean
}) {
  const { camera } = useThree()
  const controlsRef = useRef<OrbitControlsImpl>(null)

  useFrame(() => {
    if (!controlsRef.current || !enableAutoCenter) return

    const controls = controlsRef.current

    // Only lerp if auto-centering is enabled
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

export default function GraphVisualization({ data, isDemoMode = false, onSignOut, userName }: GraphVisualizationProps = {}) {
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

  // New state for Phase 1+2
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [isAddConnectionOpen, setIsAddConnectionOpen] = useState(false)
  const [userNodeId, setUserNodeId] = useState<string | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [userNodeDescription, setUserNodeDescription] = useState<string>('')
  const [isAdmin, setIsAdmin] = useState(false)

  // Store full node data for inspect panel
  const [fullNodesData, setFullNodesData] = useState<Map<string, any>>(new Map())

  // Camera animation state
  const [cameraTarget, setCameraTarget] = useState<[number, number, number]>([0, 0, 15])
  const [orbitTarget, setOrbitTarget] = useState<[number, number, number]>([0, 0, 0])
  const [enableAutoCenter, setEnableAutoCenter] = useState(false)

  // Demo mode toggle (local state overrides prop)
  const [isDemoModeLocal, setIsDemoModeLocal] = useState(isDemoMode)
  const activeDemoMode = isDemoModeLocal

  // Edit mode state
  const [isEditMode, setIsEditMode] = useState(false)

  // Connect mode state (for creating edges)
  const [isConnectMode, setIsConnectMode] = useState(false)
  const [connectSourceNodeId, setConnectSourceNodeId] = useState<string | null>(null)

  // Theme-aware colors
  const backgroundColor = theme === 'light' ? '#FAFAFA' : '#0A0A0A'
  const accentColor = theme === 'light' ? '#00A86B' : '#0088FF' // Klein Bottle Green / Deep Space Blue
  const borderColor = theme === 'light' ? '#E5E7EB' : '#374151' // gray-200 / gray-700

  // Fetch user's node ID (Phase 1+2)
  useEffect(() => {
    if (activeDemoMode) return // Skip in demo mode

    const fetchUserNode = async () => {
      const supabase = createClient()

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setCurrentUserId(user.id)

        // Check if user is admin
        const { data: userData } = await supabase
          .from('users')
          .select('is_admin')
          .eq('auth_user_id', user.id)
          .maybeSingle()

        if (userData?.is_admin) {
          setIsAdmin(true)
        }

        // Fetch user's node
        const response = await fetch('/api/me/node')
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.node) {
            setUserNodeId(data.node.id)
            setUserNodeDescription(data.node.description || '')
            // Auto-center on user's node if not already centered
            if (!centeredNodeId) {
              setCenteredNodeId(data.node.id)
            }
          }
        }
      }
    }

    fetchUserNode()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeDemoMode])

  // Handle ESC key to exit connect mode
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isConnectMode) {
        handleExitConnectMode()
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isConnectMode])

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
        .select('id, type, name, description, email, url, endpoint_url, confirmed, is_demo, controlled_by')

      if (activeDemoMode) {
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

      if (activeDemoMode) {
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

      // Store full node data for inspect panel
      const fullDataMap = new Map()
      nodesData?.forEach((node) => {
        fullDataMap.set(node.id, node)
      })
      setFullNodesData(fullDataMap)

      setNodes(graphNodes)
      setEdges(graphEdges)
      setLoading(false)

      // Set initial centered node in demo mode (Zaphod Beeblebrox)
      if (activeDemoMode && graphNodes.length > 0 && !centeredNodeId) {
        // Find Zaphod node (hardcoded ID from seed data)
        const zaphodId = 'a1111111-1111-1111-1111-111111111111'
        const zaphodNode = graphNodes.find(n => n.id === zaphodId)
        setCenteredNodeId(zaphodNode ? zaphodId : graphNodes[0].id)
      }
    }

    fetchGraphData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, activeDemoMode])

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
  const handleNodeClick = async (nodeId: string) => {
    const node = simulatedNodes.find(n => n.id === nodeId)

    // CONNECT MODE: Create edge and exit
    if (isConnectMode && connectSourceNodeId) {
      console.log('[Connect Mode] Creating edge from', connectSourceNodeId, 'to', nodeId)

      // Prompt for edge label
      const label = prompt('Label this connection (optional):') || ''

      try {
        const response = await fetch('/api/edges', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from_node_id: connectSourceNodeId,
            to_node_id: nodeId,
            label: label || undefined
          })
        })

        if (!response.ok) {
          const error = await response.json()
          alert(`Failed to create edge: ${error.error}`)
          return
        }

        const edgeData = await response.json()
        console.log('[Connect Mode] Edge created:', edgeData)

        // Add edge to local state
        setEdges(prev => [...prev, { source: connectSourceNodeId, target: nodeId }])

        // Exit connect mode
        handleExitConnectMode()
      } catch (error) {
        console.error('[Connect Mode] Error creating edge:', error)
        alert('Failed to create connection')
      }

      return
    }

    // NORMAL MODE: Check visibility and center node
    const visibility = getNodeVisibility(nodeId, centeredNodeId, hopDistances)

    // Enforced traversal: can't click hop 4+ nodes
    if (!visibility.isClickable) {
      console.log('Node not clickable (hop distance too far)')
      return
    }

    console.log('Node clicked, setting as centered:', nodeId)
    setCenteredNodeId(nodeId)

    // Open inspect panel (Phase 1)
    setSelectedNodeId(nodeId)
    setIsPanelOpen(true)
  }

  // Handle "Center Me" button click (Phase 1)
  const handleCenterMe = () => {
    if (userNodeId) {
      setCenteredNodeId(userNodeId)
      setSelectedNodeId(userNodeId)
      setIsPanelOpen(true)
      // Temporarily enable auto-centering for smooth transition
      setEnableAutoCenter(true)
      // Disable after animation completes (3 seconds)
      setTimeout(() => setEnableAutoCenter(false), 3000)
    }
  }

  // Handle demo mode toggle
  const handleToggleDemoMode = () => {
    setIsDemoModeLocal(!isDemoModeLocal)
    setLoading(true)
    setCenteredNodeId(null)
    setSelectedNodeId(null)
    setIsPanelOpen(false)
  }

  // Handle node deletion
  const handleDeleteNode = async (nodeId: string) => {
    try {
      const response = await fetch(`/api/nodes/${nodeId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const error = await response.json()
        alert(`Failed to delete node: ${error.error}`)
        return
      }

      // Remove from local state
      setNodes(prev => prev.filter(n => n.id !== nodeId))
      setEdges(prev => prev.filter(e => e.source !== nodeId && e.target !== nodeId))
      setFullNodesData(prev => {
        const newMap = new Map(prev)
        newMap.delete(nodeId)
        return newMap
      })

      // Close panel
      setIsPanelOpen(false)
      setSelectedNodeId(null)

      console.log('Node deleted successfully')
    } catch (error) {
      console.error('Error deleting node:', error)
      alert('Failed to delete node')
    }
  }

  // Handle entering connect mode (from InspectPanel "Connect" button)
  const handleEnterConnectMode = () => {
    if (!centeredNodeId) return

    console.log('[Connect Mode] Entering connect mode from center:', centeredNodeId)
    setIsConnectMode(true)
    setConnectSourceNodeId(centeredNodeId) // Always connect FROM the centered node
    setIsPanelOpen(false) // Close inspect panel
    setSelectedNodeId(null) // Clear selection
  }

  // Handle exiting connect mode
  const handleExitConnectMode = () => {
    console.log('[Connect Mode] Exiting connect mode')
    setIsConnectMode(false)
    setConnectSourceNodeId(null)
  }

  // Handle connection creation (Phase 2)
  const handleCreateConnection = async (formData: ConnectionFormData) => {
    // Admin feature: if admin has selected a node, create connection from that node
    // Otherwise, create from user's node
    const sourceNodeId = isAdmin && selectedNodeId ? selectedNodeId : userNodeId

    console.log('[DEBUG] handleCreateConnection called')
    console.log('[DEBUG] isAdmin:', isAdmin)
    console.log('[DEBUG] selectedNodeId:', selectedNodeId)
    console.log('[DEBUG] userNodeId:', userNodeId)
    console.log('[DEBUG] sourceNodeId (final):', sourceNodeId)

    if (!sourceNodeId) {
      throw new Error('Source node not found')
    }

    try {
      // Step 1: Create the node
      const nodeResponse = await fetch('/api/nodes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: formData.type,
          name: formData.name,
          email: formData.email || undefined, // Person-specific
          description: formData.description || undefined,
          url: formData.url || undefined,
          endpoint_url: formData.endpoint_url || undefined,
        })
      })

      if (!nodeResponse.ok) {
        const error = await nodeResponse.json()
        throw new Error(error.error || 'Failed to create node')
      }

      const nodeData = await nodeResponse.json()
      const newNode = nodeData.node

      // Step 2: Create the edge
      const edgeResponse = await fetch('/api/edges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from_node_id: sourceNodeId,
          to_node_id: newNode.id,
          label: formData.label || undefined
        })
      })

      if (!edgeResponse.ok) {
        const error = await edgeResponse.json()
        throw new Error(error.error || 'Failed to create edge')
      }

      // Step 3: Update local state with new node and edge
      const newSimNode: SimulationNode = {
        id: newNode.id,
        name: newNode.name,
        description: newNode.description,
        type: newNode.type as NodeType,
        temperature: 5.0,
        position: [
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 10,
        ],
        velocity: [0, 0, 0],
        edges: [sourceNodeId],
        confirmed: newNode.confirmed ?? true
      }

      setNodes(prev => {
        // Update source node's edges array
        return prev.map(n =>
          n.id === sourceNodeId
            ? { ...n, edges: [...n.edges, newNode.id] }
            : n
        ).concat(newSimNode)
      })
      setEdges(prev => [...prev, { source: sourceNodeId, target: newNode.id }])

      // Add to full nodes data map
      setFullNodesData(prev => {
        const newMap = new Map(prev)
        newMap.set(newNode.id, newNode)
        return newMap
      })

      console.log('Connection created successfully:', newNode.name, 'from', sourceNodeId)
    } catch (error) {
      console.error('Error creating connection:', error)
      throw error
    }
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
      style={{
        borderColor,
        backgroundColor,
        cursor: isConnectMode ? 'crosshair' : 'default'
      }}
    >
      {/* Centered Node Info & Controls */}
      <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-start">
        {/* Left: Centered Node Info + Stats */}
        {centeredNodeId && fullNodesData.has(centeredNodeId) && (
          <div className="px-4 py-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-lg font-sans text-sm text-gray-700 dark:text-gray-300 shadow-lg">
            <div className="font-medium text-base mb-1">{fullNodesData.get(centeredNodeId)?.name}</div>
            {fullNodesData.get(centeredNodeId)?.description && (
              <div className="text-xs opacity-70 mb-3">{fullNodesData.get(centeredNodeId)?.description}</div>
            )}
            {/* Node Stats */}
            <div className="space-y-0.5 text-xs border-t border-gray-200 dark:border-gray-600 pt-2 mt-2">
              {(() => {
                const visibleNodes = simulatedNodes.filter(n => {
                  const vis = getNodeVisibility(n.id, centeredNodeId, hopDistances)
                  return vis.opacity > 0 && vis.isVisible
                }).length
                const outOfSight = nodes.length - visibleNodes

                return (
                  <>
                    <div>Nodes (total): <span className="font-medium">{nodes.length}</span></div>
                    <div>Nodes (visible): <span className="font-medium">{visibleNodes}</span></div>
                    <div>Nodes (out of sight): <span className="font-medium">{outOfSight}</span></div>
                  </>
                )
              })()}
            </div>
          </div>
        )}

        {/* Right: All Control Buttons in ONE line */}
        <div className="flex gap-2 items-center">
          {/* Theme Toggle */}
          <div className="scale-90">
            <ThemeToggle />
          </div>

          {/* Demo/Real Toggle */}
          <button
          onClick={handleToggleDemoMode}
          className="px-4 py-2 bg-white dark:bg-gray-800 border-2 rounded-lg font-sans text-sm font-medium transition-all hover:scale-105 shadow-lg"
          style={{
            borderColor: accentColor,
            color: accentColor
          }}
          title={activeDemoMode ? "Switch to real network" : "Switch to demo network (Zaphod's Zoo)"}
        >
          {activeDemoMode ? (
            <>
              <svg
                className="inline-block w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              Real
            </>
          ) : (
            <>
              <svg
                className="inline-block w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Demo
            </>
          )}
        </button>

        {/* Edit Mode Toggle - visible for admin (both networks) or authenticated user (real network only) */}
        {((isAdmin) || (currentUserId && !activeDemoMode)) && (
          <button
            onClick={() => setIsEditMode(!isEditMode)}
            className="px-4 py-2 bg-white dark:bg-gray-800 border-2 rounded-lg font-sans text-sm font-medium transition-all hover:scale-105 shadow-lg"
            style={{
              borderColor: isEditMode ? accentColor : borderColor,
              color: isEditMode ? accentColor : 'inherit',
              backgroundColor: isEditMode ? (theme === 'light' ? 'rgba(0, 168, 107, 0.1)' : 'rgba(0, 136, 255, 0.1)') : undefined
            }}
            title={isEditMode ? "Exit edit mode" : "Enter edit mode"}
          >
            <svg
              className="inline-block w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            {isEditMode ? 'Editing' : 'Edit'}
          </button>
        )}

        {/* Create Node Button (+ button) - visible only in edit mode */}
        {isEditMode && (
          <button
            onClick={() => setIsAddConnectionOpen(true)}
            className="px-4 py-2 bg-white dark:bg-gray-800 border-2 rounded-lg font-sans text-sm font-medium transition-all hover:scale-105 shadow-lg"
            style={{
              borderColor: accentColor,
              color: accentColor
            }}
            title="Create new node"
          >
            <svg
              className="inline-block w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>
        )}

        {/* Pause/Resume Button */}
        <button
          onClick={toggleSimulation}
          className="px-4 py-2 bg-white dark:bg-gray-800 border-2 rounded-lg font-sans text-sm font-medium transition-all hover:scale-105 shadow-lg"
          style={{
            borderColor: accentColor,
            color: accentColor
          }}
          title={isRunning ? "Pause physics simulation" : "Resume physics simulation"}
        >
          {isRunning ? (
            <>
              <svg
                className="inline-block w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 9v6m4-6v6"
                />
              </svg>
              Pause
            </>
          ) : (
            <>
              <svg
                className="inline-block w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                />
              </svg>
              Resume
            </>
          )}
        </button>

        {/* Center Me Button */}
        {userNodeId && !activeDemoMode && (
          <button
            onClick={handleCenterMe}
            className="px-4 py-2 bg-white dark:bg-gray-800 border-2 rounded-lg font-sans text-sm font-medium transition-all hover:scale-105 shadow-lg"
            style={{
              borderColor: accentColor,
              color: accentColor
            }}
            title="Center on your node"
          >
            <svg
              className="inline-block w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
              <circle cx="12" cy="12" r="3" strokeWidth={2} />
            </svg>
            Center Me
          </button>
        )}

        {/* Sign Out Button */}
        {onSignOut && (
          <button
            onClick={onSignOut}
            className="px-4 py-2 bg-white dark:bg-gray-800 border-2 rounded-lg font-sans text-sm font-medium transition-all hover:scale-105 shadow-lg"
            style={{
              borderColor: accentColor,
              color: accentColor
            }}
            title="Sign out"
          >
            <svg
              className="inline-block w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Sign Out
          </button>
        )}
        </div>
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
            enableAutoCenter={enableAutoCenter}
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
                opacity={
                  // Connect mode opacity: 20% for all except center/hovered
                  isConnectMode
                    ? (node.id === centeredNodeId || node.id === hoveredNodeId ? 1.0 : 0.2)
                    : visibility.opacity
                }
                nodeType={node.type}
                confirmed={node.confirmed}
                accentColor={accentColor}
                backgroundColor={backgroundColor}
              />
            )
          })}
        </Suspense>
      </Canvas>

      {/* Inspect Panel (Phase 1) */}
      <InspectPanel
        isOpen={isPanelOpen}
        onClose={() => {
          setIsPanelOpen(false)
          setSelectedNodeId(null)
        }}
        node={
          selectedNodeId && fullNodesData.has(selectedNodeId)
            ? fullNodesData.get(selectedNodeId)
            : null
        }
        currentUserId={currentUserId}
        isEditMode={isEditMode}
        isCenteredNode={selectedNodeId === centeredNodeId}
        onAddConnection={() => {
          console.log('[DEBUG] Opening Add Connection modal. Selected node:', selectedNodeId)
          setIsAddConnectionOpen(true)
        }}
        onConnect={handleEnterConnectMode}
        onDeleteNode={handleDeleteNode}
        connections={
          selectedNodeId
            ? {
                outgoing: edges
                  .filter(e => e.source === selectedNodeId)
                  .map(e => {
                    const targetNode = simulatedNodes.find(n => n.id === e.target)
                    return { id: e.target, name: targetNode?.name || 'Unknown' }
                  }),
                incoming: edges
                  .filter(e => e.target === selectedNodeId)
                  .map(e => {
                    const sourceNode = simulatedNodes.find(n => n.id === e.source)
                    return { id: e.source, name: sourceNode?.name || 'Unknown' }
                  })
              }
            : undefined
        }
      />

      {/* Add Connection Modal (Phase 2) */}
      <AddConnectionModal
        isOpen={isAddConnectionOpen}
        onClose={() => setIsAddConnectionOpen(false)}
        onSubmit={handleCreateConnection}
      />
    </div>
  )
}
