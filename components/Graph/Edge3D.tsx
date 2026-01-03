import { Line } from '@react-three/drei';
import type { GraphEdge } from '@/types';
import * as THREE from 'three';

interface Edge3DProps {
  edge: GraphEdge;
  opacity: number;
}

export default function Edge3D({ edge, opacity }: Edge3DProps) {
  const { source, target } = edge;

  // Compute arrow position at midpoint (removed useMemo - direct computation)
  const arrowPosition: [number, number, number] = [
    (source.x + target.x) / 2,
    (source.y + target.y) / 2,
    (source.z + target.z) / 2,
  ];

  // Compute arrow rotation to point toward target (removed useMemo - direct computation)
  const direction = new THREE.Vector3(
    target.x - source.x,
    target.y - source.y,
    target.z - source.z
  ).normalize();

  const quaternion = new THREE.Quaternion();
  quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);

  const euler = new THREE.Euler().setFromQuaternion(quaternion);
  const arrowRotation: [number, number, number] = [euler.x, euler.y, euler.z];

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
