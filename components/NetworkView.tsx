'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import type { Node, Edge } from '@/types';
import GraphCanvas from '@/components/Graph/GraphCanvas';
import ThemeToggle from '@/components/ui/ThemeToggle';

interface NetworkViewProps {
  userEmail: string;
  userNodeId: string | null;
  userName: string;
}

export default function NetworkView({ userEmail, userNodeId, userName }: NetworkViewProps) {
  const router = useRouter();
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [loading, setLoading] = useState(true);
  const [centerNodeId, setCenterNodeId] = useState<string | null>(userNodeId);

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

      if (nodesRes.data) setNodes(nodesRes.data);
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
        alert('Test data created! Refreshing...');
        await fetchGraphData();
        setCenterNodeId(userNodeId);
      } else {
        alert('Failed to reset: ' + data.error);
      }
    } catch (error) {
      alert('Failed to reset network');
    }
  };

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
            onNodeClick={(nodeId) => setCenterNodeId(nodeId)}
          />
        )}
      </div>
    </div>
  );
}
