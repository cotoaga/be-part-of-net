'use client'

import { Line } from '@react-three/drei'

interface Edge3DProps {
  start: [number, number, number]
  end: [number, number, number]
}

export default function Edge3D({ start, end }: Edge3DProps) {
  return (
    <Line
      points={[start, end]}
      color="#10b981"
      lineWidth={1}
      transparent
      opacity={0.4}
    />
  )
}
