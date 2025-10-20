'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface SaturnRingProps {
  radius: number // Radius of the ring
  color?: string
  speed?: number // Rotation speed
}

export default function SaturnRing({
  radius,
  color = '#0088FF',
  speed = 1.0,
}: SaturnRingProps) {
  const ringRef = useRef<THREE.Mesh>(null)
  const outerRingRef = useRef<THREE.Mesh>(null)

  // Animate rotation
  useFrame((state) => {
    if (ringRef.current) {
      // Rotate around Y axis
      ringRef.current.rotation.y += 0.01 * speed

      // Subtle wobble effect
      ringRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.05
    }

    if (outerRingRef.current) {
      // Counter-rotate outer ring for layered effect
      outerRingRef.current.rotation.y -= 0.005 * speed
      outerRingRef.current.rotation.z = Math.cos(state.clock.elapsedTime * 0.7) * 0.03
    }
  })

  const innerRadius = radius * 1.5
  const outerRadius = radius * 1.7
  const outerInnerRadius = radius * 1.8
  const outerOuterRadius = radius * 2.0

  return (
    <group>
      {/* Inner ring */}
      <mesh ref={ringRef} rotation={[Math.PI / 4, 0, 0]}>
        <ringGeometry args={[innerRadius, outerRadius, 64]} />
        <meshBasicMaterial
          color={color}
          side={THREE.DoubleSide}
          transparent
          opacity={0.4}
        />
      </mesh>

      {/* Outer ring (fainter, slower) */}
      <mesh ref={outerRingRef} rotation={[Math.PI / 3, 0, 0]}>
        <ringGeometry args={[outerInnerRadius, outerOuterRadius, 64]} />
        <meshBasicMaterial
          color={color}
          side={THREE.DoubleSide}
          transparent
          opacity={0.2}
        />
      </mesh>

      {/* Particle trail effect (optional enhancement) */}
      {/* <ParticleTrail radius={innerRadius} color={color} /> */}
    </group>
  )
}
