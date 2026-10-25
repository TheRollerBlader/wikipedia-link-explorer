import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { WikiNode, WikiLink, SimulationConfig, GraphMetrics } from './types/graph';
import {
  fetchArticleSummary,
  fetchArticleLinks,
  cleanTitle
} from './services/wikipediaApi';
import { OFFLINE_KNOWLEDGE_BASE, inferCategory } from './services/offlineData';
import {
  computeGraphMetrics,
  recalculateNodeDegrees
} from './services/networkTheory';
import { ForceGraphCanvas } from './components/ForceGraphCanvas';
import { ArticleTooltip } from './components/ArticleTooltip';
import { ArticleInspector } from './components/ArticleInspector';
import { PathFinderPanel } from './components/PathFinderPanel';
import { TelemetryPanel } from './components/TelemetryPanel';
import { ControlsHeader } from './components/ControlsHeader';

export const App: React.FC = () => {
  // Graph state
  const [nodes, setNodes] = useState<WikiNode[]>([]);
  const [links, setLinks] = useState<WikiLink[]>([]);
  const [historyTrail, setHistoryTrail] = useState<string[]>(['Alan Turing']);

  // Selection & UI State
  const [selectedNode, setSelectedNode] = useState<WikiNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<WikiNode | null>(null);
  const [hoverCoords, setHoverCoords] = useState<{ x: number; y: number } | null>(null);
  const [graphFilterQuery, setGraphFilterQuery] = useState<string>('');

  // Path Finder State
  const [isPathFinderOpen, setIsPathFinderOpen] = useState<boolean>(false);
  const [pathSourceId, setPathSourceId] = useState<string>('');
  const [pathTargetId, setPathTargetId] = useState<string>('');
  const [highlightedPath, setHighlightedPath] = useState<string[]>([]);

  // Telemetry Panel State
  const [isTelemetryOpen, setIsTelemetryOpen] = useState<boolean>(false);

  // Simulation & Visual Config
  const [config, setConfig] = useState<SimulationConfig>({
    charge: -320,
    linkDistance: 80,
    linkStrength: 0.6,
    collisionRadius: 8,
    colorMode: 'depth',
    labelVisibility: 'central',
    showArrows: false,
    particleSpeed: 1,
  });

  // Calculate live graph metrics
  const metrics = useMemo<GraphMetrics>(() => {
    return computeGraphMetrics(nodes, links);
  }, [nodes, links]);

  /**
   * Initialize initial seed topic graph
   */
  const loadInitialTopic = useCallback(async (seedTopic: string) => {
    const cleanSeed = cleanTitle(seedTopic);
    const summary = await fetchArticleSummary(cleanSeed);
    const initialLinks = await fetchArticleLinks(cleanSeed, 12);

    const rootNode: WikiNode = {
      id: cleanSeed,
      title: summary.title || cleanSeed,
      degree: initialLinks.length,
      inDegree: 0,
      outDegree: initialLinks.length,
      depth: 0,
      category: inferCategory(cleanSeed, summary.extract),
      summary: summary.extract,
      thumbnail: summary.thumbnailUrl,
      description: summary.description,
      url: summary.pageUrl,
      expanded: true,
      x: 0,
      y: 0,
    };

    const newNodes: WikiNode[] = [rootNode];
    const newLinks: WikiLink[] = [];

    // Create child nodes arranged radially around root
    initialLinks.forEach((linkTitle, index) => {
      const angle = (index / initialLinks.length) * 2 * Math.PI;
      const dist = 110 + (index % 3) * 25;
      const childSummary = OFFLINE_KNOWLEDGE_BASE[linkTitle];

      const childNode: WikiNode = {
        id: linkTitle,
        title: linkTitle,
        degree: 1,
        inDegree: 1,
        outDegree: 0,
        depth: 1,
        category: inferCategory(linkTitle, childSummary?.summary),
        summary: childSummary?.summary,
        thumbnail: childSummary?.thumbnail,
        description: childSummary?.description,
        url: `https://en.wikipedia.org/wiki/${encodeURIComponent(linkTitle)}`,
        expanded: false,
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
      };

      newNodes.push(childNode);
      newLinks.push({
        source: rootNode.id,
        target: childNode.id,
      });
    });

    // Check for inter-child connections from offline DB
    for (let i = 0; i < newNodes.length; i++) {
      for (let j = i + 1; j < newNodes.length; j++) {
        const u = newNodes[i];
        const v = newNodes[j];
        const uOff = OFFLINE_KNOWLEDGE_BASE[u.id];
        if (uOff && uOff.links && uOff.links.includes(v.id)) {
          newLinks.push({ source: u.id, target: v.id });
        }
      }
    }

    recalculateNodeDegrees(newNodes, newLinks);
    setNodes(newNodes);
    setLinks(newLinks);
    setSelectedNode(rootNode);
    setHistoryTrail([cleanSeed]);
    setHighlightedPath([]);
  }, []);

  // Initial load
  useEffect(() => {
    loadInitialTopic('Alan Turing');
  }, [loadInitialTopic]);

  /**
   * Search for a topic from search bar or preset
   */
  const handleSearchTopic = async (topic: string) => {
    const clean = cleanTitle(topic);

    // If node already exists on canvas, just select it!
    const existing = nodes.find(n => n.id.toLowerCase() === clean.toLowerCase());
    if (existing) {
      setSelectedNode(existing);
      return;
    }

    // Otherwise load as fresh topic or add as seed
    await loadInitialTopic(clean);
  };

  /**
   * Expand a node outwards by fetching its outgoing Wikipedia links
   */
  const handleExpandNode = async (node: WikiNode) => {
    if (node.loading) return;

    // Set loading indicator
    setNodes(prev =>
      prev.map(n => (n.id === node.id ? { ...n, loading: true } : n))
    );

    try {
      const outgoingLinks = await fetchArticleLinks(node.id, 10);
      const nodeMap = new Map(nodes.map(n => [n.id, n]));
      const linkSet = new Set(
        links.map(l => {
          const s = typeof l.source === 'object' ? (l.source as WikiNode).id : l.source;
          const t = typeof l.target === 'object' ? (l.target as WikiNode).id : l.target;
          return `${s}->${t}`;
        })
      );

      const addedNodes: WikiNode[] = [];
      const addedLinks: WikiLink[] = [];

      outgoingLinks.forEach((linkTitle, idx) => {
        const clean = cleanTitle(linkTitle);
        const linkKey = `${node.id}->${clean}`;

        if (!linkSet.has(linkKey)) {
          linkSet.add(linkKey);
          addedLinks.push({
            source: node.id,
            target: clean,
          });
        }

        // If child node does not yet exist in graph, spawn it
        if (!nodeMap.has(clean)) {
          const angle = (idx / outgoingLinks.length) * 2 * Math.PI + Math.random() * 0.4;
          const distance = 80 + Math.random() * 40;
          const parentX = node.x ?? 0;
          const parentY = node.y ?? 0;

          const off = OFFLINE_KNOWLEDGE_BASE[clean];

          const newNode: WikiNode = {
            id: clean,
            title: clean,
            degree: 1,
            inDegree: 1,
            outDegree: 0,
            depth: node.depth + 1,
            category: inferCategory(clean, off?.summary),
            summary: off?.summary,
            thumbnail: off?.thumbnail,
            description: off?.description,
            url: `https://en.wikipedia.org/wiki/${encodeURIComponent(clean)}`,
            expanded: false,
            x: parentX + Math.cos(angle) * distance,
            y: parentY + Math.sin(angle) * distance,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
          };

          nodeMap.set(clean, newNode);
          addedNodes.push(newNode);
        }
      });

      const updatedNodes = [...nodes, ...addedNodes].map(n =>
        n.id === node.id ? { ...n, expanded: true, loading: false } : n
      );
      const updatedLinks = [...links, ...addedLinks];

      recalculateNodeDegrees(updatedNodes, updatedLinks);

      setNodes(updatedNodes);
      setLinks(updatedLinks);

      // Add to history trail
      if (!historyTrail.includes(node.id)) {
        setHistoryTrail(prev => [...prev, node.id]);
      }

      // Update selected node reference
      const updatedSelected = updatedNodes.find(n => n.id === node.id);
      if (updatedSelected) {
        setSelectedNode(updatedSelected);
      }
    } catch (err) {
      console.error('Failed to expand node:', err);
      setNodes(prev =>
        prev.map(n => (n.id === node.id ? { ...n, loading: false } : n))
      );
    }
  };

  /**
   * Hover tracking with summary fetching if missing
   */
  const handleNodeHover = useCallback(
    (node: WikiNode | null, coords?: { x: number; y: number }) => {
      setHoveredNode(node);
      setHoverCoords(coords || null);

      if (node && !node.summary) {
        // Asynchronously fetch summary on hover for rich tooltip
        fetchArticleSummary(node.id).then(summary => {
          setNodes(prev =>
            prev.map(n =>
              n.id === node.id
                ? {
                    ...n,
                    summary: summary.extract,
                    thumbnail: summary.thumbnailUrl,
                    description: summary.description,
                  }
                : n
            )
          );
        });
      }
    },
    []
  );

  /**
   * Select node on click and ensure summary is loaded
   */
  const handleNodeClick = useCallback(async (node: WikiNode) => {
    setSelectedNode(node);

    if (!node.summary || !node.thumbnail) {
      const summary = await fetchArticleSummary(node.id);
      setNodes(prev =>
        prev.map(n =>
          n.id === node.id
            ? {
                ...n,
                summary: summary.extract,
                thumbnail: summary.thumbnailUrl,
                description: summary.description,
              }
            : n
        )
      );
      setSelectedNode(prev => (prev?.id === node.id ? { ...prev, ...summary } : prev));
    }
  }, []);

  /**
   * Toggle pinned position
   */
  const handleTogglePin = (node: WikiNode) => {
    setNodes(prev =>
      prev.map(n => {
        if (n.id === node.id) {
          const nextPinned = !n.pinned;
          return {
            ...n,
            pinned: nextPinned,
            fx: nextPinned ? n.x : null,
            fy: nextPinned ? n.y : null,
          };
        }
        return n;
      })
    );
  };

  /**
   * Path Finder setters
   */
  const handleSetPathStart = (nodeId: string) => {
    setPathSourceId(nodeId);
    setIsPathFinderOpen(true);
  };

  const handleSetPathEnd = (nodeId: string) => {
    setPathTargetId(nodeId);
    setIsPathFinderOpen(true);
  };

  /**
   * JSON Export
   */
  const handleExportJSON = () => {
    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      nodes: nodes.map(n => ({
        id: n.id,
        title: n.title,
        degree: n.degree,
        category: n.category,
        depth: n.depth,
        summary: n.summary,
        thumbnail: n.thumbnail,
        description: n.description,
        url: n.url,
        pinned: n.pinned,
        x: n.x,
        y: n.y,
      })),
      links: links.map(l => ({
        source: typeof l.source === 'object' ? (l.source as WikiNode).id : l.source,
        target: typeof l.target === 'object' ? (l.target as WikiNode).id : l.target,
      })),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `wikipedia-graph-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  /**
   * JSON Import
   */
  const handleImportJSON = (file: File) => {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        if (data && Array.isArray(data.nodes) && Array.isArray(data.links)) {
          const importedNodes: WikiNode[] = data.nodes.map((n: Partial<WikiNode>) => ({
            id: n.id || n.title || 'Unknown',
            title: n.title || n.id || 'Unknown',
            degree: n.degree || 0,
            inDegree: 0,
            outDegree: 0,
            depth: n.depth || 0,
            category: n.category || inferCategory(n.title || ''),
            summary: n.summary,
            thumbnail: n.thumbnail,
            description: n.description,
            url: n.url || `https://en.wikipedia.org/wiki/${encodeURIComponent(n.id || '')}`,
            expanded: true,
            pinned: n.pinned,
            x: n.x,
            y: n.y,
            fx: n.pinned ? n.x : null,
            fy: n.pinned ? n.y : null,
          }));

          const importedLinks: WikiLink[] = data.links.map((l: { source: string; target: string }) => ({
            source: l.source,
            target: l.target,
          }));

          recalculateNodeDegrees(importedNodes, importedLinks);
          setNodes(importedNodes);
          setLinks(importedLinks);
          if (importedNodes.length > 0) {
            setSelectedNode(importedNodes[0]);
          }
          setHighlightedPath([]);
        } else {
          alert('Invalid graph JSON structure.');
        }
      } catch (err) {
        alert('Failed to parse graph JSON file: ' + err);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#080c14] font-sans">
      {/* Top Controls Header */}
      <ControlsHeader
        onSearchTopic={handleSearchTopic}
        graphFilterQuery={graphFilterQuery}
        onSetGraphFilterQuery={setGraphFilterQuery}
        config={config}
        onUpdateConfig={updates => setConfig(prev => ({ ...prev, ...updates }))}
        onResetGraph={() => loadInitialTopic('Alan Turing')}
        onExportJSON={handleExportJSON}
        onImportJSON={handleImportJSON}
        historyTrail={historyTrail}
        onSelectHistoryTopic={handleSearchTopic}
        isPathFinderOpen={isPathFinderOpen}
        onTogglePathFinder={() => setIsPathFinderOpen(!isPathFinderOpen)}
        isTelemetryOpen={isTelemetryOpen}
        onToggleTelemetry={() => setIsTelemetryOpen(!isTelemetryOpen)}
      />

      {/* Main Interactive Canvas */}
      <main className="w-full h-full pt-20">
        <ForceGraphCanvas
          nodes={nodes}
          links={links}
          config={config}
          selectedNode={selectedNode}
          hoveredNode={hoveredNode}
          highlightedPath={highlightedPath}
          searchQuery={graphFilterQuery}
          onNodeClick={handleNodeClick}
          onNodeHover={handleNodeHover}
          onExpandNode={handleExpandNode}
        />
      </main>

      {/* Hover Tooltip */}
      <ArticleTooltip node={hoveredNode} coords={hoverCoords} />

      {/* Article Inspector Drawer */}
      {selectedNode && (
        <ArticleInspector
          node={selectedNode}
          links={links}
          allNodes={nodes}
          onClose={() => setSelectedNode(null)}
          onExpand={handleExpandNode}
          onSelectNode={handleNodeClick}
          onSetPathStart={handleSetPathStart}
          onSetPathEnd={handleSetPathEnd}
          onTogglePin={handleTogglePin}
        />
      )}

      {/* Left Dock: Pathfinder & Telemetry Panels */}
      <div className="fixed top-24 left-4 z-40 flex flex-col gap-3 max-w-sm pointer-events-none">
        {/* BFS Shortest Path Finder Panel */}
        {isPathFinderOpen && (
          <div className="pointer-events-auto">
            <PathFinderPanel
              nodes={nodes}
              links={links}
              sourceId={pathSourceId}
              targetId={pathTargetId}
              onSetSourceId={setPathSourceId}
              onSetTargetId={setPathTargetId}
              onHighlightPath={setHighlightedPath}
              onSelectNode={handleNodeClick}
              onClose={() => setIsPathFinderOpen(false)}
            />
          </div>
        )}

        {/* Network Telemetry & Degree Distribution Panel */}
        {isTelemetryOpen && (
          <div className="pointer-events-auto">
            <TelemetryPanel
              metrics={metrics}
              onSelectNodeById={id => {
                const node = nodes.find(n => n.id === id);
                if (node) handleNodeClick(node);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
