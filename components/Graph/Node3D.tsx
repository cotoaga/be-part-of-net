import { useRef, useState } from 'react';
import { Sphere, Html } from '@react-three/drei';
import { useThree, useFrame } from '@react-three/fiber';
import type { Mesh, Vector3, Group } from 'three';
import type { GraphNode } from '@/types';
import * as THREE from 'three';

interface Node3DProps {
  node: GraphNode;
  opacity: number;
  isCenter: boolean;
  isRoot: boolean;
  onClick: () => void;
  onDragStart: (nodeId: string) => void;
  onDrag: (nodeId: string, position: [number, number, number]) => void;
  onDragEnd: () => void;
  isDragged: boolean;
}

export default function Node3D({
  node,
  opacity,
  isCenter,
  isRoot,
  onClick,
  onDragStart,
  onDrag,
  onDragEnd,
  isDragged
}: Node3DProps) {
  const groupRef = useRef<Group>(null);
  const meshRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const { camera, size, raycaster } = useThree();
  const dragPlaneRef = useRef(new THREE.Plane());
  const dragOffsetRef = useRef(new THREE.Vector3());
  const isDraggingRef = useRef(false);

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

  // Update position and scale every frame
  useFrame(() => {
    if (groupRef.current) {
      // Update position from force simulation (unless being dragged)
      if (!isDraggingRef.current) {
        groupRef.current.position.set(node.x, node.y, node.z);
      }

      // Smooth scale transition for hover/drag state
      const targetScale = (hovered || isDragged) ? 1.2 : 1;
      groupRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        0.2
      );
    }
  });

  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    isDraggingRef.current = true;

    // Calculate drag plane perpendicular to camera
    const cameraDirection = new THREE.Vector3();
    camera.getWorldDirection(cameraDirection);
    dragPlaneRef.current.setFromNormalAndCoplanarPoint(
      cameraDirection,
      new THREE.Vector3(node.x, node.y, node.z)
    );

    // Store offset between pointer and node center
    const intersection = new THREE.Vector3();
    raycaster.ray.intersectPlane(dragPlaneRef.current, intersection);
    if (intersection) {
      dragOffsetRef.current.set(
        node.x - intersection.x,
        node.y - intersection.y,
        node.z - intersection.z
      );
    }

    onDragStart(node.id);
  };

  const handlePointerMove = (e: any) => {
    if (!isDraggingRef.current) return;
    e.stopPropagation();

    // Project pointer position onto drag plane
    const intersection = new THREE.Vector3();
    raycaster.ray.intersectPlane(dragPlaneRef.current, intersection);

    if (intersection) {
      const newPos: [number, number, number] = [
        intersection.x + dragOffsetRef.current.x,
        intersection.y + dragOffsetRef.current.y,
        intersection.z + dragOffsetRef.current.z
      ];

      // Update both the node data and the visual position immediately
      onDrag(node.id, newPos);

      if (groupRef.current) {
        groupRef.current.position.set(newPos[0], newPos[1], newPos[2]);
      }
    }
  };

  const handlePointerUp = (e: any) => {
    if (!isDraggingRef.current) return;
    e.stopPropagation();
    isDraggingRef.current = false;
    onDragEnd();
  };

  const handleClick = (e: any) => {
    e.stopPropagation();
    // Only trigger click if we weren't dragging
    if (!isDraggingRef.current) {
      onClick();
    }
  };

  return (
    <group ref={groupRef}>
      <Sphere
        ref={meshRef}
        args={[scale, 16, 16]}
        onClick={handleClick}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = isDragged ? 'grabbing' : 'grab';
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHovered(false);
          if (!isDraggingRef.current) {
            document.body.style.cursor = 'auto';
          }
        }}
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
