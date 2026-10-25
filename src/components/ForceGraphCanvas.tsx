import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { WikiNode, WikiLink, SimulationConfig } from '../types/graph';
import { getNodeRadius, getNodeColor } from '../services/networkTheory';
import { ZoomIn, ZoomOut, Maximize2, RefreshCw, Camera } from 'lucide-react';

interface ForceGraphCanvasProps {
  nodes: WikiNode[];
  links: WikiLink[];
  config: SimulationConfig;
  selectedNode: WikiNode | null;
  hoveredNode: WikiNode | null;
  highlightedPath: string[];
  searchQuery: string;
  onNodeClick: (node: WikiNode) => void;
  onNodeHover: (node: WikiNode | null, coords?: { x: number; y: number }) => void;
  onExpandNode: (node: WikiNode) => void;
}

export const ForceGraphCanvas: React.FC<ForceGraphCanvasProps> = ({
  nodes,
  links,
  config,
  selectedNode,
  hoveredNode,
  highlightedPath,
  searchQuery,
  onNodeClick,
  onNodeHover,
  onExpandNode,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // D3 force simulation ref
  const simulationRef = useRef<d3.Simulation<WikiNode, WikiLink> | null>(null);
  const transformRef = useRef<d3.ZoomTransform>(d3.zoomIdentity);
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<HTMLCanvasElement, unknown> | null>(null);

  const [fps, setFps] = useState<number>(60);
  const animationFrameIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());
  const frameCountRef = useRef<number>(0);

  // Keep path lookup set for fast O(1) checks
  const pathSet = useRef<Set<string>>(new Set());
  const pathEdgeSet = useRef<Set<string>>(new Set());

  useEffect(() => {
    pathSet.current = new Set(highlightedPath);
    const edges = new Set<string>();
    for (let i = 0; i < highlightedPath.length - 1; i++) {
      const u = highlightedPath[i];
      const v = highlightedPath[i + 1];
      edges.add(`${u}->${v}`);
      edges.add(`${v}->${u}`);
    }
    pathEdgeSet.current = edges;
  }, [highlightedPath]);

  // Main rendering loop function
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const transform = transformRef.current;

    ctx.save();
    ctx.clearRect(0, 0, width, height);

    // Apply dark cyber background grid
    ctx.fillStyle = '#080c14';
    ctx.fillRect(0, 0, width, height);

    // Draw subtle coordinate grid
    ctx.save();
    ctx.translate(transform.x, transform.y);
    ctx.scale(transform.k, transform.k);

    const gridSize = 80;
    const startX = Math.floor((-transform.x / transform.k) / gridSize) * gridSize - gridSize;
    const endX = startX + (width / transform.k) + gridSize * 2;
    const startY = Math.floor((-transform.y / transform.k) / gridSize) * gridSize - gridSize;
    const endY = startY + (height / transform.k) + gridSize * 2;

    ctx.strokeStyle = 'rgba(30, 41, 59, 0.4)';
    ctx.lineWidth = 0.5 / transform.k;
    ctx.beginPath();
    for (let x = startX; x <= endX; x += gridSize) {
      ctx.moveTo(x, startY);
      ctx.lineTo(x, endY);
    }
    for (let y = startY; y <= endY; y += gridSize) {
      ctx.moveTo(startX, y);
      ctx.lineTo(endX, y);
    }
    ctx.stroke();

    const hasActivePath = highlightedPath.length > 0;
    const hasSearch = searchQuery.trim().length > 0;
    const lowerSearch = searchQuery.trim().toLowerCase();

    // 1. Draw Links
    links.forEach(link => {
      const source = link.source as WikiNode;
      const target = link.target as WikiNode;
      if (!source.x || !source.y || !target.x || !target.y) return;

      const isPathEdge = pathEdgeSet.current.has(`${source.id}->${target.id}`);
      
      let strokeColor = 'rgba(71, 85, 105, 0.35)';
      let lineWidth = 1.2;

      if (hasActivePath) {
        if (isPathEdge) {
          strokeColor = '#f59e0b'; // Amber golden path
          lineWidth = 3.5;
        } else {
          strokeColor = 'rgba(51, 65, 85, 0.12)';
          lineWidth = 0.8;
        }
      } else if (hasSearch) {
        const sMatch = source.title.toLowerCase().includes(lowerSearch);
        const tMatch = target.title.toLowerCase().includes(lowerSearch);
        if (sMatch || tMatch) {
          strokeColor = 'rgba(56, 189, 248, 0.7)';
          lineWidth = 1.8;
        } else {
          strokeColor = 'rgba(51, 65, 85, 0.15)';
          lineWidth = 0.6;
        }
      }

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(source.x, source.y);
      ctx.lineTo(target.x, target.y);
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = lineWidth;

      if (isPathEdge) {
        ctx.shadowColor = '#fbbf24';
        ctx.shadowBlur = 10;
      }
      ctx.stroke();
      ctx.restore();

      // Draw subtle directional arrow if configured
      if (config.showArrows && !hasActivePath) {
        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const angle = Math.atan2(dy, dx);
        const targetRadius = getNodeRadius(target.degree);
        const arrowDist = targetRadius + 6;
        const arrowX = target.x - Math.cos(angle) * arrowDist;
        const arrowY = target.y - Math.sin(angle) * arrowDist;

        ctx.save();
        ctx.fillStyle = strokeColor;
        ctx.translate(arrowX, arrowY);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-6, -3);
        ctx.lineTo(-6, 3);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
    });

    // 2. Draw Nodes
    nodes.forEach(node => {
      if (node.x === undefined || node.y === undefined) return;

      const radius = getNodeRadius(node.degree);
      const isSelected = selectedNode?.id === node.id;
      const isHovered = hoveredNode?.id === node.id;
      const inPath = pathSet.current.has(node.id);
      const isPathStart = highlightedPath.length > 0 && highlightedPath[0] === node.id;
      const isPathEnd = highlightedPath.length > 0 && highlightedPath[highlightedPath.length - 1] === node.id;
      const matchesSearch = hasSearch && node.title.toLowerCase().includes(lowerSearch);

      let alpha = 1.0;
      if (hasActivePath && !inPath) {
        alpha = 0.22;
      } else if (hasSearch && !matchesSearch) {
        alpha = 0.25;
      }

      const baseColor = getNodeColor(node, config.colorMode);

      ctx.save();
      ctx.globalAlpha = alpha;

      // Outer glow for special states
      if (isPathStart || isPathEnd || inPath || isSelected || matchesSearch) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius + (isPathStart || isPathEnd ? 8 : 5), 0, 2 * Math.PI);
        ctx.fillStyle = isPathStart
          ? 'rgba(34, 197, 94, 0.35)'
          : isPathEnd
          ? 'rgba(244, 63, 94, 0.35)'
          : inPath
          ? 'rgba(245, 158, 11, 0.4)'
          : matchesSearch
          ? 'rgba(56, 189, 248, 0.45)'
          : 'rgba(168, 85, 247, 0.4)';
        ctx.fill();
        ctx.restore();
      }

      // Draw Main Node Circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
      ctx.fillStyle = baseColor;
      ctx.shadowColor = baseColor;
      ctx.shadowBlur = isSelected || inPath ? 14 : 5;
      ctx.fill();

      // Node border
      ctx.lineWidth = isSelected ? 2.5 : isHovered ? 2 : 1.2;
      ctx.strokeStyle = isSelected
        ? '#ffffff'
        : isPathStart
        ? '#4ade80'
        : isPathEnd
        ? '#fb7185'
        : inPath
        ? '#fef08a'
        : 'rgba(255, 255, 255, 0.7)';
      ctx.stroke();

      // Draw pin indicator if pinned
      if (node.pinned) {
        ctx.beginPath();
        ctx.arc(node.x + radius * 0.7, node.y - radius * 0.7, 3, 0, 2 * Math.PI);
        ctx.fillStyle = '#f59e0b';
        ctx.fill();
      }

      // 3. Draw Labels
      let showLabel = false;
      if (config.labelVisibility === 'all') {
        showLabel = true;
      } else if (config.labelVisibility === 'central') {
        showLabel = node.degree >= 4 || inPath || isSelected || isHovered || matchesSearch;
      } else {
        // 'hover'
        showLabel = isHovered || isSelected || inPath || matchesSearch;
      }

      if (showLabel) {
        ctx.font = `${Math.max(11, Math.min(14, 10 + radius * 0.2))}px Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';

        // Background pill for label legibility
        const text = node.title;
        const textMetrics = ctx.measureText(text);
        const textWidth = textMetrics.width;
        const labelY = node.y + radius + 4;

        ctx.fillStyle = 'rgba(8, 12, 20, 0.85)';
        ctx.beginPath();
        ctx.roundRect(
          node.x - textWidth / 2 - 4,
          labelY - 1,
          textWidth + 8,
          16,
          3
        );
        ctx.fill();

        // Label text
        ctx.fillStyle = inPath
          ? '#fef08a'
          : isSelected
          ? '#ffffff'
          : matchesSearch
          ? '#38bdf8'
          : '#e2e8f0';
        ctx.fillText(text, node.x, labelY);
      }

      ctx.restore();
    });

    ctx.restore(); // Undo zoom transform
    ctx.restore();

    // FPS calculation
    frameCountRef.current++;
    const now = performance.now();
    if (now - lastTimeRef.current >= 1000) {
      setFps(Math.round((frameCountRef.current * 1000) / (now - lastTimeRef.current)));
      frameCountRef.current = 0;
      lastTimeRef.current = now;
    }
  }, [nodes, links, config, selectedNode, hoveredNode, highlightedPath, searchQuery]);

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      const container = containerRef.current;
      const canvas = canvasRef.current;
      if (!container || !canvas) return;

      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
      }

      if (simulationRef.current) {
        simulationRef.current.force(
          'center',
          d3.forceCenter(rect.width / 2, rect.height / 2).strength(0.08)
        );
        simulationRef.current.alpha(0.3).restart();
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize and update D3 force simulation
  useEffect(() => {
    const container = containerRef.current;
    if (!container || nodes.length === 0) return;

    const rect = container.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Build or update simulation
    let sim = simulationRef.current;
    if (!sim) {
      sim = d3
        .forceSimulation<WikiNode, WikiLink>()
        .force(
          'link',
          d3
            .forceLink<WikiNode, WikiLink>()
            .id(d => d.id)
            .distance(config.linkDistance)
            .strength(config.linkStrength)
        )
        .force('charge', d3.forceManyBody().strength(config.charge))
        .force('center', d3.forceCenter(width / 2, height / 2).strength(0.08))
        .force(
          'collide',
          d3
            .forceCollide<WikiNode>()
            .radius(d => getNodeRadius(d.degree) + config.collisionRadius)
            .iterations(2)
        )
        .alphaDecay(0.022);

      simulationRef.current = sim;
    } else {
      // Update forces based on config
      const linkForce = sim.force('link') as d3.ForceLink<WikiNode, WikiLink>;
      if (linkForce) {
        linkForce.distance(config.linkDistance).strength(config.linkStrength);
      }
      const chargeForce = sim.force('charge') as d3.ForceManyBody<WikiNode>;
      if (chargeForce) {
        chargeForce.strength(config.charge);
      }
      const collideForce = sim.force('collide') as d3.ForceCollide<WikiNode>;
      if (collideForce) {
        collideForce.radius(d => getNodeRadius(d.degree) + config.collisionRadius);
      }
    }

    sim.nodes(nodes);
    const linkForce = sim.force('link') as d3.ForceLink<WikiNode, WikiLink>;
    if (linkForce) {
      linkForce.links(links);
    }

    sim.alpha(0.4).restart();

    // Animation frame render loop
    const tick = () => {
      render();
      animationFrameIdRef.current = requestAnimationFrame(tick);
    };

    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
    }
    animationFrameIdRef.current = requestAnimationFrame(tick);

    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [nodes, links, config, render]);

  // Setup D3 Zoom and Pan
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const zoom = d3
      .zoom<HTMLCanvasElement, unknown>()
      .scaleExtent([0.15, 4.0])
      .on('zoom', event => {
        transformRef.current = event.transform;
      });

    zoomBehaviorRef.current = zoom;
    d3.select(canvas).call(zoom);

    // Initial center transform
    const container = containerRef.current;
    if (container) {
      const initialTransform = d3.zoomIdentity.translate(0, 0).scale(1);
      d3.select(canvas).call(zoom.transform, initialTransform);
    }

    return () => {
      d3.select(canvas).on('.zoom', null);
    };
  }, []);

  // Find node under mouse coords
  const getNodeAtCoords = useCallback(
    (clientX: number, clientY: number): WikiNode | null => {
      const canvas = canvasRef.current;
      if (!canvas) return null;

      const rect = canvas.getBoundingClientRect();
      const mouseX = clientX - rect.left;
      const mouseY = clientY - rect.top;

      const transform = transformRef.current;
      const graphX = (mouseX - transform.x) / transform.k;
      const graphY = (mouseY - transform.y) / transform.k;

      // Reverse iterate to pick top-most rendered node
      for (let i = nodes.length - 1; i >= 0; i--) {
        const node = nodes[i];
        if (node.x === undefined || node.y === undefined) continue;

        const radius = getNodeRadius(node.degree);
        const hitRadius = Math.max(radius + 4, 14); // slightly generous hit target
        const dx = graphX - node.x;
        const dy = graphY - node.y;

        if (dx * dx + dy * dy <= hitRadius * hitRadius) {
          return node;
        }
      }
      return null;
    },
    [nodes]
  );

  // Setup Node Drag & Interaction
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let draggedNode: WikiNode | null = null;
    let isDragging = false;
    let startX = 0;
    let startY = 0;

    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return; // Left click only
      const node = getNodeAtCoords(e.clientX, e.clientY);
      if (node) {
        draggedNode = node;
        startX = e.clientX;
        startY = e.clientY;
        isDragging = false;

        // Fix position during drag
        node.fx = node.x;
        node.fy = node.y;
        if (simulationRef.current) {
          simulationRef.current.alphaTarget(0.3).restart();
        }
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const screenX = e.clientX - rect.left;
      const screenY = e.clientY - rect.top;

      if (draggedNode) {
        const dist = Math.hypot(e.clientX - startX, e.clientY - startY);
        if (dist > 3) isDragging = true;

        const transform = transformRef.current;
        draggedNode.fx = (screenX - transform.x) / transform.k;
        draggedNode.fy = (screenY - transform.y) / transform.k;
      } else {
        // Hover detection
        const hovered = getNodeAtCoords(e.clientX, e.clientY);
        if (hovered) {
          canvas.style.cursor = 'pointer';
          onNodeHover(hovered, { x: e.clientX, y: e.clientY });
        } else {
          canvas.style.cursor = 'default';
          onNodeHover(null);
        }
      }
    };

    const onMouseUp = () => {
      if (draggedNode) {
        if (!isDragging) {
          // It was a click!
          onNodeClick(draggedNode);
        } else {
          // Node was dragged; pin it
          draggedNode.pinned = true;
        }

        if (simulationRef.current) {
          simulationRef.current.alphaTarget(0);
        }
        draggedNode = null;
        isDragging = false;
      }
    };

    const onDoubleClick = (e: MouseEvent) => {
      const node = getNodeAtCoords(e.clientX, e.clientY);
      if (node) {
        // Toggle pin state or trigger expansion
        if (node.pinned) {
          node.pinned = false;
          node.fx = null;
          node.fy = null;
          if (simulationRef.current) {
            simulationRef.current.alpha(0.2).restart();
          }
        } else {
          onExpandNode(node);
        }
      }
    };

    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('dblclick', onDoubleClick);

    return () => {
      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('dblclick', onDoubleClick);
    };
  }, [getNodeAtCoords, onNodeClick, onNodeHover, onExpandNode]);

  // Zoom control helpers
  const handleZoomIn = () => {
    const canvas = canvasRef.current;
    if (!canvas || !zoomBehaviorRef.current) return;
    d3.select(canvas).transition().duration(250).call(zoomBehaviorRef.current.scaleBy, 1.35);
  };

  const handleZoomOut = () => {
    const canvas = canvasRef.current;
    if (!canvas || !zoomBehaviorRef.current) return;
    d3.select(canvas).transition().duration(250).call(zoomBehaviorRef.current.scaleBy, 0.74);
  };

  const handleResetZoom = () => {
    const canvas = canvasRef.current;
    if (!canvas || !zoomBehaviorRef.current) return;
    d3.select(canvas).transition().duration(400).call(zoomBehaviorRef.current.transform, d3.zoomIdentity);
  };

  const handleReheatSimulation = () => {
    if (simulationRef.current) {
      nodes.forEach(n => {
        if (!n.pinned) {
          n.fx = null;
          n.fy = null;
        }
      });
      simulationRef.current.alpha(0.8).restart();
    }
  };

  const handleExportPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create high-res download
    const link = document.createElement('a');
    link.download = `wikipedia-link-graph-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden select-none bg-[#080c14]">
      <canvas ref={canvasRef} className="block w-full h-full" />

      {/* Canvas Overlay Controls */}
      <div className="absolute bottom-6 right-6 flex items-center gap-2 bg-[#0f172a]/80 backdrop-blur-md border border-slate-700/60 p-1.5 rounded-xl shadow-xl">
        <button
          onClick={handleZoomIn}
          title="Zoom In"
          className="p-2 hover:bg-slate-700/60 rounded-lg text-slate-300 hover:text-white transition-colors"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          title="Zoom Out"
          className="p-2 hover:bg-slate-700/60 rounded-lg text-slate-300 hover:text-white transition-colors"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleResetZoom}
          title="Reset View"
          className="p-2 hover:bg-slate-700/60 rounded-lg text-slate-300 hover:text-white transition-colors"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
        <div className="h-4 w-px bg-slate-700" />
        <button
          onClick={handleReheatSimulation}
          title="Re-run Force Simulation Physics"
          className="p-2 hover:bg-slate-700/60 rounded-lg text-slate-300 hover:text-sky-400 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
        <button
          onClick={handleExportPNG}
          title="Export Graph as PNG Image"
          className="p-2 hover:bg-slate-700/60 rounded-lg text-slate-300 hover:text-emerald-400 transition-colors"
        >
          <Camera className="w-4 h-4" />
        </button>
      </div>

      {/* Physics HUD Overlay */}
      <div className="absolute top-4 left-4 pointer-events-none flex items-center gap-3 bg-[#0f172a]/70 backdrop-blur-sm border border-slate-800/80 px-3 py-1.5 rounded-lg text-xs font-mono text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${fps > 45 ? 'bg-emerald-400' : 'bg-amber-400'} animate-pulse`} />
          {fps} FPS
        </span>
        <span className="text-slate-600">|</span>
        <span>{nodes.length} Vertices</span>
        <span className="text-slate-600">|</span>
        <span>{links.length} Edges</span>
      </div>
    </div>
  );
};
