import { useRef, useState } from 'react';
import { Sphere, Html } from '@react-three/drei';
import type { Mesh } from 'three';
import type { GraphNode } from '@/types';

interface Node3DProps {
  node: GraphNode;
  opacity: number;
  isCenter: boolean;
  isRoot: boolean;
  onClick: () => void;
}

export default function Node3D({ node, opacity, isCenter, isRoot, onClick }: Node3DProps) {
  const meshRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Node size based on connection count (min 0.3, max 1.0)
  const connectionCount = node.edges.length;
  const scale = Math.min(0.3 + connectionCount * 0.1, 1.0);

  // Node color based on type
  let color: string;
  switch (node.type) {
    case 'person':
      color = '#3B82F6'; // Blue
      break;
    case 'url':
      color = '#F97316'; // Orange
      break;
    case 'mcp':
      color = '#8B5CF6'; // Purple
      break;
    default:
      color = '#10B981'; // Emerald fallback
  }

  // Root node gets golden glow
  if (isRoot) {
    color = '#FFD700'; // Gold
  }

  return (
    <group position={[node.x, node.y, node.z]}>
      <Sphere
        ref={meshRef}
        args={[scale, 16, 16]}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
        scale={hovered ? 1.2 : 1}
      >
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isCenter ? 0.5 : isRoot ? 0.3 : 0.1}
          opacity={opacity}
          transparent
          metalness={0.5}
          roughness={0.5}
        />
      </Sphere>

      {/* Root node ring */}
      {isRoot && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[scale * 1.3, scale * 1.5, 32]} />
          <meshBasicMaterial color="#FFD700" opacity={opacity * 0.5} transparent />
        </mesh>
      )}

      {/* Label on hover */}
      {(hovered || isCenter) && opacity > 0.5 && (
        <Html distanceFactor={10} position={[0, scale + 0.5, 0]} center>
          <div
            className="px-2 py-1 rounded text-xs whitespace-nowrap pointer-events-none"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              color: 'white',
            }}
          >
            {node.name}
          </div>
        </Html>
      )}
    </group>
  );
}
