import { useRef } from 'react';
import { Line } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import type { GraphEdge } from '@/types';
import type { Mesh } from 'three';
import * as THREE from 'three';

interface Edge3DProps {
  edge: GraphEdge;
  opacity: number;
  lineWidth?: number;
}

export default function Edge3D({ edge, opacity, lineWidth = 1 }: Edge3DProps) {
  const { source, target } = edge;
  const arrowRef = useRef<Mesh>(null);
  const lineRef = useRef<any>(null);

  // Update arrow position and rotation every frame to track node movements
  useFrame(() => {
    if (arrowRef.current) {
      // Update arrow position (midpoint)
      arrowRef.current.position.set(
        (source.x + target.x) / 2,
        (source.y + target.y) / 2,
        (source.z + target.z) / 2
      );

      // Update arrow rotation (point toward target)
      const direction = new THREE.Vector3(
        target.x - source.x,
        target.y - source.y,
        target.z - source.z
      ).normalize();

      const quaternion = new THREE.Quaternion();
      quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);

      arrowRef.current.quaternion.copy(quaternion);
    }

    // Update line endpoints
    if (lineRef.current) {
      lineRef.current.geometry.setPositions([
        source.x, source.y, source.z,
        target.x, target.y, target.z,
      ]);
    }
  });

  return (
    <group>
      {/* Main line */}
      <Line
        ref={lineRef}
        points={[
          [source.x, source.y, source.z],
          [target.x, target.y, target.z],
        ]}
        color="#10B981" // Emerald
        lineWidth={lineWidth}
        opacity={opacity * 0.4}
        transparent
      />

      {/* Arrow head */}
      <mesh ref={arrowRef}>
        <coneGeometry args={[0.1, 0.2, 8]} />
        <meshBasicMaterial color="#10B981" opacity={opacity * 0.6} transparent />
      </mesh>
    </group>
  );
}
