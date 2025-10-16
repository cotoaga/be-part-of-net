'use client'

import { useRef, useState } from 'react'
import { ThreeEvent } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'

interface Node3DProps {
  id: string
  name: string
  position: [number, number, number]
  temperature: number
  edgeCount: number
  onClick?: (id: string) => void
  isSelected?: boolean
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

export default function Node3D({
  id,
  name,
  position,
  temperature,
  edgeCount,
  onClick,
  isSelected = false,
}: Node3DProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)

  const size = 0.3 + edgeCount * 0.05
  const color = getTemperatureColor(temperature)
  const scale = isSelected ? 1.3 : hovered ? 1.15 : 1.0

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    onClick?.(id)
  }

  return (
    <group position={position}>
      {/* Main sphere */}
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHovered(true)
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          setHovered(false)
          document.body.style.cursor = 'default'
        }}
        scale={scale}
      >
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.3}
          roughness={0.4}
          metalness={0.6}
        />
      </mesh>

      {/* Selection ring */}
      {isSelected && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[size * 1.3, size * 1.4, 32]} />
          <meshBasicMaterial color="#10b981" side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Label on hover */}
      {hovered && (
        <Text
          position={[0, size * 1.5, 0]}
          fontSize={0.3}
          color="#10b981"
          anchorX="center"
          anchorY="bottom"
        >
          {name}
        </Text>
      )}
    </group>
  )
}
