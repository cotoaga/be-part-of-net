'use client'

import { Line } from '@react-three/drei'

interface Edge3DProps {
  start: [number, number, number]
  end: [number, number, number]
  color?: string
}

export default function Edge3D({ start, end, color = '#10b981' }: Edge3DProps) {
  return (
    <Line
      points={[start, end]}
      color={color}
      lineWidth={1}
      transparent
      opacity={0.4}
    />
  )
}
