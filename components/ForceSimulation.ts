import { useEffect, useRef, useState } from 'react'
import type { NodeType } from '@/types/graph'

export interface SimulationNode {
  id: string
  name: string
  description?: string
  type?: NodeType
  temperature: number
  position: [number, number, number]
  velocity: [number, number, number]
  edges: string[]
  confirmed?: boolean
  is_global_service?: boolean // MCP nodes visible to all (exempt from fog-of-war)
}

interface SimulationConfig {
  springLength: number
  springStrength: number
  repulsionStrength: number
  damping: number
  centeringForce: number
}

const DEFAULT_CONFIG: SimulationConfig = {
  springLength: 3.0,
  springStrength: 0.05,
  repulsionStrength: 2.0,
  damping: 0.9,
  centeringForce: 0.01,
}

export function useForceSimulation(
  initialNodes: SimulationNode[],
  edges: [string, string][],
  config: Partial<SimulationConfig> = {}
) {
  const [simulatedNodes, setSimulatedNodes] = useState(initialNodes)
  const [isRunning, setIsRunning] = useState(true)
  const animationRef = useRef<number>()
  const configRef = useRef({ ...DEFAULT_CONFIG, ...config })

  // Update nodes when initialNodes change
  useEffect(() => {
    setSimulatedNodes(initialNodes)
  }, [initialNodes])

  useEffect(() => {
    if (!isRunning || simulatedNodes.length === 0) return

    const simulate = () => {
      setSimulatedNodes((currentNodes) => {
        const newNodes = currentNodes.map((node) => ({ ...node }))
        const cfg = configRef.current

        // For each node, calculate forces
        newNodes.forEach((node, i) => {
          let fx = 0, fy = 0, fz = 0

          // Repulsion from all other nodes (Coulomb's law)
          newNodes.forEach((other, j) => {
            if (i === j) return

            const dx = node.position[0] - other.position[0]
            const dy = node.position[1] - other.position[1]
            const dz = node.position[2] - other.position[2]
            const distSq = dx * dx + dy * dy + dz * dz + 0.01 // Avoid division by zero
            const dist = Math.sqrt(distSq)

            const force = cfg.repulsionStrength / distSq
            fx += (dx / dist) * force
            fy += (dy / dist) * force
            fz += (dz / dist) * force
          })

          // Spring attraction to connected nodes (Hooke's law)
          node.edges.forEach((connectedId) => {
            const other = newNodes.find((n) => n.id === connectedId)
            if (!other) return

            const dx = other.position[0] - node.position[0]
            const dy = other.position[1] - node.position[1]
            const dz = other.position[2] - node.position[2]
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz + 0.01)

            const force = cfg.springStrength * (dist - cfg.springLength)
            fx += (dx / dist) * force
            fy += (dy / dist) * force
            fz += (dz / dist) * force
          })

          // Weak centering force (keeps graph from drifting away)
          fx -= node.position[0] * cfg.centeringForce
          fy -= node.position[1] * cfg.centeringForce
          fz -= node.position[2] * cfg.centeringForce

          // Update velocity with damping
          const newVelX = (node.velocity[0] + fx) * cfg.damping
          const newVelY = (node.velocity[1] + fy) * cfg.damping
          const newVelZ = (node.velocity[2] + fz) * cfg.damping

          // Create NEW arrays for position and velocity (so React detects changes)
          node.velocity = [newVelX, newVelY, newVelZ]
          node.position = [
            node.position[0] + newVelX,
            node.position[1] + newVelY,
            node.position[2] + newVelZ
          ]
        })

        return newNodes
      })

      animationRef.current = requestAnimationFrame(simulate)
    }

    animationRef.current = requestAnimationFrame(simulate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isRunning, simulatedNodes.length])

  return {
    nodes: simulatedNodes,
    toggleSimulation: () => setIsRunning((r) => !r),
    isRunning,
  }
}
