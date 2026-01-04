'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import type { Node, Edge } from '@/types';
import { InteractionMode, PanelType } from '@/types';
import { softRefetchGraphData } from '@/lib/refetch';
import GraphCanvas from '@/components/Graph/GraphCanvas';
import ThemeToggle from '@/components/ui/ThemeToggle';

interface NetworkViewProps {
  userEmail: string;
  userNodeId: string | null;
  userName: string;
}

export default function NetworkView({ userEmail, userNodeId, userName }: NetworkViewProps) {
  const router = useRouter();

  // Existing state
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [loading, setLoading] = useState(true);
  const [centerNodeId, setCenterNodeId] = useState<string | null>(userNodeId);
  const [recenterTrigger, setRecenterTrigger] = useState(0);

  // Phase 2: Interaction state
  const [interactionMode, setInteractionMode] = useState<InteractionMode>(InteractionMode.IDLE);
  const [connectSourceId, setConnectSourceId] = useState<string | null>(null);
  const [physicsPaused, setPhysicsPaused] = useState(false);

  // Phase 2: Panel state (single panel model)
  const [activePanel, setActivePanel] = useState<PanelType>(PanelType.NONE);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Phase 2: Debug overlay toggle
  const [debugVisible, setDebugVisible] = useState(true);

  useEffect(() => {
    fetchGraphData();
  }, []);

  const fetchGraphData = async () => {
    try {
      const supabase = createClient();

      const [nodesRes, edgesRes] = await Promise.all([
        supabase.from('nodes').select('*').order('created_at'),
        supabase.from('edges').select('*'),
      ]);

      if (nodesRes.data) {
        setNodes(nodesRes.data);

        // Always ensure we have a center node
        // Priority: 1) userNodeId, 2) root node, 3) any node
        if (!userNodeId) {
          const rootNode = nodesRes.data.find(n => n.invited_by === null);
          const fallbackNode = rootNode || nodesRes.data[0];
          if (fallbackNode) {
            console.log('Setting center to:', fallbackNode.name, fallbackNode.id);
            setCenterNodeId(fallbackNode.id);
          }
        }
      }
      if (edgesRes.data) setEdges(edgesRes.data);
    } catch (error) {
      console.error('Failed to fetch graph data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  const handleReset = async () => {
    if (!confirm('Reset network to test data? This will delete all existing data.')) {
      return;
    }

    try {
      const response = await fetch('/api/reset', { method: 'POST' });
      const data = await response.json();

      if (data.success) {
        // Phase 2: Use soft refetch instead of hard reload
        await handleRefetch();
      } else {
        alert('Failed to reset: ' + data.error);
      }
    } catch (error) {
      alert('Failed to reset network');
    }
  };

  const handleRecenter = () => {
    setRecenterTrigger(prev => prev + 1);
  };

  // Phase 2: Soft refetch (replaces window.location.reload())
  const handleRefetch = async () => {
    const supabase = createClient();
    const result = await softRefetchGraphData(supabase, setNodes, setEdges);
    return result.success;
  };

  // Phase 2: Refetch and center on new node
  const handleRefetchAndCenter = async (newNodeId: string) => {
    await handleRefetch();
    setCenterNodeId(newNodeId);
  };

  // Phase 2: State transition functions
  const openPanel = (panel: PanelType, nodeId?: string) => {
    setActivePanel(panel);
    setSelectedNodeId(nodeId || null);
    // Reset connect mode when opening a panel
    setInteractionMode(InteractionMode.IDLE);
    setConnectSourceId(null);
  };

  const closePanel = () => {
    setActivePanel(PanelType.NONE);
    setSelectedNodeId(null);
  };

  const startConnectMode = () => {
    setInteractionMode(InteractionMode.CONNECT_SELECT);
    setConnectSourceId(null);
    // Close any open panels
    setActivePanel(PanelType.NONE);
  };

  const exitConnectMode = () => {
    setInteractionMode(InteractionMode.IDLE);
    setConnectSourceId(null);
  };

  // Phase 2: Connect mode handlers
  const handleConnectSelect = (nodeId: string) => {
    setConnectSourceId(nodeId);
    setInteractionMode(InteractionMode.CONNECT_TARGET);
  };

  const handleConnectTarget = (nodeId: string) => {
    setSelectedNodeId(nodeId);
    setActivePanel(PanelType.CONNECT);
    // Keep connect mode active until panel closes
  };

  // Phase 2: ESC key listener (single listener for all)
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // Priority 1: Exit connect mode
        if (interactionMode !== InteractionMode.IDLE) {
          exitConnectMode();
        }
        // Priority 2: Close panel
        else if (activePanel !== PanelType.NONE) {
          closePanel();
        }
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [interactionMode, activePanel]);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-[var(--color-surface)]">
        <div>
          <h1 className="text-xl font-bold">be-part-of.net</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Welcome, {userName}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button onClick={handleSignOut} className="btn-secondary">
            Sign Out
          </button>
        </div>
      </header>

      {/* Control Bar */}
      <div className="flex items-center gap-2 p-3 border-b border-gray-200 dark:border-gray-800 bg-[var(--color-surface)]">
        <button onClick={handleReset} className="btn-secondary text-sm">
          Reset Network
        </button>
        <button onClick={handleRecenter} className="btn-secondary text-sm">
          Recenter View
        </button>
        <div className="flex-1" />
        <div className="text-xs text-[var(--color-text-secondary)]">
          {nodes.length} nodes • {edges.length} connections
        </div>
      </div>

      {/* Graph Canvas */}
      <div className="flex-1 relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-[var(--color-text-secondary)]">
              Loading network...
            </div>
          </div>
        ) : (
          <GraphCanvas
            nodes={nodes}
            edges={edges}
            centerNodeId={centerNodeId}
            onNodeClick={(nodeId) => {
              setCenterNodeId(nodeId);
              // Phase 2: Open inspector panel when clicking node
              openPanel(PanelType.INSPECTOR, nodeId);
            }}
            recenterTrigger={recenterTrigger}
            // Phase 2: Connect mode props
            interactionMode={interactionMode}
            connectSourceId={connectSourceId}
            onConnectSelect={handleConnectSelect}
            onConnectTarget={handleConnectTarget}
            // Phase 2: Physics control
            physicsPaused={physicsPaused}
            // Phase 2: Debug visibility
            debugVisible={debugVisible}
          />
        )}
      </div>
    </div>
  );
}
