'use client'

import { useRef, useState } from 'react'
import { ThreeEvent } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import type { NodeType } from '@/types/graph'
import SaturnRing from './SaturnRing'

interface Node3DProps {
  id: string
  name: string
  position: [number, number, number]
  temperature: number
  edgeCount: number
  onClick?: (id: string) => void
  isSelected?: boolean
  isCentered?: boolean
  isClickable?: boolean
  showLabel?: boolean
  opacity?: number
  nodeType?: NodeType
  confirmed?: boolean
  accentColor?: string
  backgroundColor?: string
}

function lerpColor(color1: string, color2: string, t: number): string {
  const c1 = new THREE.Color(color1)
  const c2 = new THREE.Color(color2)
  return '#' + c1.lerp(c2, t).getHexString()
}

function getTemperatureColor(temp: number): string {
  const normalized = Math.max(0, Math.min(10, temp)) / 10

  if (normalized < 0.33) {
    // COLD: Dark blue → Blue
    const t = normalized / 0.33
    return lerpColor('#1e3a8a', '#3b82f6', t)
  } else if (normalized < 0.66) {
    // MEDIUM: Blue → Yellow
    const t = (normalized - 0.33) / 0.33
    return lerpColor('#3b82f6', '#eab308', t)
  } else {
    // HOT: Yellow → Red
    const t = (normalized - 0.66) / 0.34
    return lerpColor('#eab308', '#ef4444', t)
  }
}

function getNodeTypeColor(nodeType?: NodeType): string {
  switch (nodeType) {
    case 'person':
      return '#3b82f6' // Blue
    case 'app':
      return '#f59e0b' // Orange
    case 'mcp':
      return '#8b5cf6' // Purple
    default:
      return '#10b981' // Default green
  }
}

export default function Node3D({
  id,
  name,
  position,
  temperature,
  edgeCount,
  onClick,
  isSelected = false,
  isCentered = false,
  isClickable = true,
  showLabel = true,
  opacity = 1.0,
  nodeType,
  confirmed = true,
  accentColor = '#10b981',
  backgroundColor = '#000000',
}: Node3DProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)

  const size = 0.3 + edgeCount * 0.05

  // Use node type color if available, otherwise temperature color
  const baseColor = nodeType ? getNodeTypeColor(nodeType) : getTemperatureColor(temperature)

  // Apply ghost effect for unconfirmed person nodes
  const finalOpacity = confirmed ? opacity : Math.min(opacity, 0.15)

  const scale = isCentered ? 1.4 : isSelected ? 1.3 : hovered ? 1.15 : 1.0

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    if (isClickable) {
      onClick?.(id)
    }
  }

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    if (isClickable) {
      setHovered(true)
      document.body.style.cursor = 'pointer'
    }
  }

  const handlePointerOut = () => {
    setHovered(false)
    document.body.style.cursor = 'default'
  }

  return (
    <group position={position}>
      {/* Main sphere */}
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        scale={scale}
      >
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial
          color={baseColor}
          emissive={baseColor}
          emissiveIntensity={0.3}
          roughness={0.4}
          metalness={0.6}
          opacity={finalOpacity}
          transparent={finalOpacity < 1.0}
        />
      </mesh>

      {/* Saturn ring for centered node */}
      {isCentered && (
        <SaturnRing radius={size} color={accentColor} speed={1.0} />
      )}

      {/* Selection ring */}
      {isSelected && !isCentered && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[size * 1.3, size * 1.4, 32]} />
          <meshBasicMaterial
            color={accentColor}
            side={THREE.DoubleSide}
            opacity={finalOpacity}
            transparent={finalOpacity < 1.0}
          />
        </mesh>
      )}

      {/* Label on hover or if showLabel is true */}
      {(hovered || (showLabel && isCentered)) && (
        <Html
          position={[0, size * 1.5, 0]}
          center
          distanceFactor={10}
          zIndexRange={[100, 0]}
          style={{
            color: accentColor,
            fontSize: '14px',
            fontFamily: 'var(--font-inter), sans-serif',
            fontWeight: 'bold',
            background: `${backgroundColor}e6`, // 90% opacity
            padding: '6px 12px',
            borderRadius: '6px',
            border: `1px solid ${accentColor}`,
            boxShadow: `0 0 10px ${accentColor}50`,
            pointerEvents: 'none',
            userSelect: 'none',
            whiteSpace: 'nowrap',
            textShadow: `0 0 8px ${accentColor}cc`,
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            opacity: finalOpacity,
          }}
        >
          {name}
        </Html>
      )}
    </group>
  )
}
