import { useRef, useState } from 'react';
import { Sphere, Html } from '@react-three/drei';
import { useThree, useFrame } from '@react-three/fiber';
import type { Mesh, Vector3, Group } from 'three';
import type { GraphNode } from '@/types';
import { InteractionMode } from '@/types';
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
  // Phase 2: Connect mode props
  interactionMode: InteractionMode;
  connectSourceId: string | null;
  onConnectSelect: (nodeId: string) => void;
  onConnectTarget: (nodeId: string) => void;
  // Size multipliers
  nodeSizeMultiplier: number;
  labelSizeMultiplier: number;
  // Label visibility
  show3DLabels: boolean;
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
  isDragged,
  interactionMode,
  connectSourceId,
  onConnectSelect,
  onConnectTarget,
  nodeSizeMultiplier,
  labelSizeMultiplier,
  show3DLabels
}: Node3DProps) {
  const groupRef = useRef<Group>(null);
  const meshRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const { camera, size, raycaster } = useThree();
  const dragPlaneRef = useRef(new THREE.Plane());
  const dragOffsetRef = useRef(new THREE.Vector3());
  const isDraggingRef = useRef(false);

  // Node size based on connection count (min 0.3, max 1.0) with multiplier
  const connectionCount = node.edges.length;
  const baseScale = Math.min(0.3 + connectionCount * 0.1, 1.0);
  const scale = baseScale * nodeSizeMultiplier;

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

    // Phase 2: Prevent drag during connect mode
    const isInConnectMode = interactionMode !== InteractionMode.IDLE;
    if (isInConnectMode) {
      return;
    }

    isDraggingRef.current = true;

    // Capture pointer to ensure we receive all events even if cursor leaves the sphere
    if (e.target && e.pointerId !== undefined) {
      e.target.setPointerCapture(e.pointerId);
    }

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

    // Release pointer capture
    if (e.target && e.pointerId !== undefined) {
      e.target.releasePointerCapture(e.pointerId);
    }

    isDraggingRef.current = false;
    onDragEnd();
  };

  const handleClick = (e: any) => {
    e.stopPropagation();

    // Only trigger click if we weren't dragging
    if (isDraggingRef.current) {
      console.log('[Node3D] Click suppressed - was dragging');
      return;
    }

    // Phase 2: Priority 1 - Connect mode selection
    if (interactionMode === InteractionMode.CONNECT_SELECT) {
      console.log('[Node3D] Connect mode: selecting source node:', node.name);
      onConnectSelect(node.id);
      return;
    }

    if (interactionMode === InteractionMode.CONNECT_TARGET) {
      console.log('[Node3D] Connect mode: selecting target node:', node.name);
      onConnectTarget(node.id);
      return;
    }

    // Phase 2: Priority 2 - Normal click (center node only)
    console.log('[Node3D] Normal click on node:', node.name, node.id);
    onClick();
  };

  // Phase 2: Visual feedback for connect mode
  const isInConnectMode = interactionMode !== InteractionMode.IDLE;
  const isConnectSource = node.id === connectSourceId;
  const isValidTarget = interactionMode === InteractionMode.CONNECT_TARGET && node.id !== connectSourceId;

  // Adjust opacity for connect mode
  let finalOpacity = opacity;
  if (isInConnectMode && !isConnectSource && !isValidTarget) {
    finalOpacity = opacity * 0.3; // Fade non-relevant nodes
  }

  // Adjust emissive intensity for connect mode
  let emissiveIntensity = isCenter ? 0.6 : isRoot ? 0.4 : 0.15;
  if (isConnectSource) {
    emissiveIntensity = 0.8; // Glow source node
  } else if (isValidTarget && hovered) {
    emissiveIntensity = 0.5; // Highlight hovered targets
  }

  return (
    <group ref={groupRef}>
      <Sphere
        ref={meshRef}
        args={[scale, 64, 64]} // High resolution for smooth spheres
        onClick={handleClick}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          // Phase 2: Cursor changes for connect mode
          if (isInConnectMode) {
            document.body.style.cursor = 'pointer';
          } else {
            document.body.style.cursor = isDragged ? 'grabbing' : 'grab';
          }
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
          emissiveIntensity={emissiveIntensity}
          opacity={finalOpacity}
          transparent
          metalness={0.85} // High metalness for reflective look
          roughness={0.25} // Low roughness for shiny surface
          envMapIntensity={1.5} // Enhance environment reflections
        />
      </Sphere>

      {/* Root node ring with improved appearance */}
      {isRoot && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[scale * 1.3, scale * 1.5, 64]} />
          <meshStandardMaterial
            color="#FFD700"
            emissive="#FFD700"
            emissiveIntensity={0.3}
            metalness={0.9}
            roughness={0.2}
            opacity={finalOpacity * 0.6}
            transparent
          />
        </mesh>
      )}

      {/* Label - conditionally visible based on show3DLabels toggle */}
      {show3DLabels && finalOpacity > 0.1 && (
        <Html distanceFactor={8} position={[0, scale + 0.5, 0]} center>
          <div
            className="px-3 py-1.5 rounded font-medium whitespace-nowrap pointer-events-none"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.75)',
              color: 'white',
              fontSize: `${0.875 * labelSizeMultiplier}rem`, // 0.875rem = text-sm
            }}
          >
            {node.name}
          </div>
        </Html>
      )}
    </group>
  );
}
