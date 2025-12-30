import { useMemo } from 'react';
import { Line } from '@react-three/drei';
import type { GraphEdge } from '@/types';
import * as THREE from 'three';

interface Edge3DProps {
  edge: GraphEdge;
  opacity: number;
}

export default function Edge3D({ edge, opacity }: Edge3DProps) {
  const { source, target } = edge;

  // Create arrow at the midpoint pointing toward target
  const arrowPosition = useMemo(() => {
    return [
      (source.x + target.x) / 2,
      (source.y + target.y) / 2,
      (source.z + target.z) / 2,
    ] as [number, number, number];
  }, [source.x, source.y, source.z, target.x, target.y, target.z]);

  const arrowRotation = useMemo(() => {
    const direction = new THREE.Vector3(
      target.x - source.x,
      target.y - source.y,
      target.z - source.z
    ).normalize();

    const quaternion = new THREE.Quaternion();
    quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);

    const euler = new THREE.Euler().setFromQuaternion(quaternion);
    return [euler.x, euler.y, euler.z] as [number, number, number];
  }, [source.x, source.y, source.z, target.x, target.y, target.z]);

  return (
    <group>
      {/* Main line */}
      <Line
        points={[
          [source.x, source.y, source.z],
          [target.x, target.y, target.z],
        ]}
        color="#10B981" // Emerald
        lineWidth={1}
        opacity={opacity * 0.4}
        transparent
      />

      {/* Arrow head */}
      <mesh position={arrowPosition} rotation={arrowRotation}>
        <coneGeometry args={[0.1, 0.2, 8]} />
        <meshBasicMaterial color="#10B981" opacity={opacity * 0.6} transparent />
      </mesh>
    </group>
  );
}
