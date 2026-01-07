'use client';

import { useCallback, useEffect, useState, useRef } from 'react';
import * as THREE from 'three';
import type { GraphNode } from '@/types';
import type { VisibilityInfo } from '@/lib/fogOfWar';

interface ScreenPosition {
  x: number;
  y: number;
  visible: boolean; // false if behind camera or outside viewport
}

interface NodeNameplatesProps {
  nodes: GraphNode[];
  visibility: Map<string, VisibilityInfo>;
  centerNodeId: string | null;
  rootNodeId: string | null;
  onNodeClick: (nodeId: string) => void;
  camera: THREE.Camera;
  size: { width: number; height: number };
  enabled: boolean;
}

export default function NodeNameplates({
  nodes,
  visibility,
  centerNodeId,
  rootNodeId,
  onNodeClick,
  camera,
  size,
  enabled
}: NodeNameplatesProps) {
  const [projections, setProjections] = useState<Map<string, ScreenPosition>>(new Map());
  const rafRef = useRef<number>();

  // Project 3D positions to screen space
  const updateProjections = useCallback(() => {
    const newProjections = new Map<string, ScreenPosition>();
    const vector = new THREE.Vector3();

    nodes.forEach((node) => {
      const vis = visibility.get(node.id);
      // Only project visible nodes (fog-of-war: 0-3 hops)
      if (!vis || vis.opacity === 0) return;

      // Copy position and project to NDC space (-1 to 1)
      vector.set(node.x, node.y, node.z);
      vector.project(camera);

      // Check if behind camera (z > 1 in NDC)
      if (vector.z > 1) {
        newProjections.set(node.id, { x: 0, y: 0, visible: false });
        return;
      }

      // Convert from NDC (-1 to 1) to screen space (0 to width/height)
      const x = (vector.x * 0.5 + 0.5) * size.width;
      const y = (-(vector.y * 0.5) + 0.5) * size.height; // Invert Y axis

      // Check if outside viewport bounds (with margin for smooth transitions)
      const margin = 100;
      const inBounds =
        x >= -margin && x <= size.width + margin &&
        y >= -margin && y <= size.height + margin;

      newProjections.set(node.id, { x, y, visible: inBounds });
    });

    setProjections(newProjections);
  }, [nodes, visibility, camera, size]);

  // Update projections every frame
  useEffect(() => {
    if (!enabled) return;

    const animate = () => {
      updateProjections();
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [enabled, updateProjections]);

  if (!enabled) return null;

  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 10 }}
    >
      {nodes.map((node) => {
        const vis = visibility.get(node.id);
        const pos = projections.get(node.id);

        // Only render visible nodes with valid projections
        if (!vis || vis.opacity === 0 || !pos || !pos.visible) return null;

        const isCenter = node.id === centerNodeId;
        const isRoot = node.id === rootNodeId;

        return (
          <button
            key={node.id}
            onClick={(e) => {
              e.stopPropagation();
              onNodeClick(node.id);
            }}
            className="absolute pointer-events-auto transform -translate-x-1/2 translate-y-2
                       px-3 py-1.5 rounded-lg font-medium whitespace-nowrap text-sm
                       transition-all duration-150 hover:scale-110 hover:shadow-lg
                       cursor-pointer"
            style={{
              left: `${pos.x}px`,
              top: `${pos.y}px`,
              backgroundColor: isRoot
                ? 'rgba(255, 215, 0, 0.95)'
                : isCenter
                  ? 'rgba(16, 185, 129, 0.95)'
                  : 'rgba(0, 0, 0, 0.85)',
              color: isRoot || isCenter ? 'black' : 'white',
              opacity: vis.opacity,
              border: isCenter ? '2px solid #10B981' : isRoot ? '2px solid #FFD700' : 'none',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            }}
          >
            {node.name}
          </button>
        );
      })}
    </div>
  );
}
