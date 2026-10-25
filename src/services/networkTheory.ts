import { WikiNode, WikiLink, GraphMetrics, PathFindingResult } from '../types/graph';
import { CATEGORY_COLORS } from './offlineData';

/**
 * Calculates in-degree, out-degree, and total degree for all nodes.
 */
export function recalculateNodeDegrees(nodes: WikiNode[], links: WikiLink[]): void {
  const inMap = new Map<string, number>();
  const outMap = new Map<string, number>();

  nodes.forEach(n => {
    inMap.set(n.id, 0);
    outMap.set(n.id, 0);
  });

  links.forEach(l => {
    const sId = typeof l.source === 'object' ? (l.source as WikiNode).id : l.source;
    const tId = typeof l.target === 'object' ? (l.target as WikiNode).id : l.target;

    outMap.set(sId, (outMap.get(sId) || 0) + 1);
    inMap.set(tId, (inMap.get(tId) || 0) + 1);
  });

  nodes.forEach(n => {
    n.inDegree = inMap.get(n.id) || 0;
    n.outDegree = outMap.get(n.id) || 0;
    n.degree = n.inDegree + n.outDegree;
  });
}

/**
 * Computes graph telemetry metrics:
 * - Density D = 2E / (V * (V - 1))
 * - Degree distribution
 * - Top nodes by degree centrality
 * - Connected components count
 */
export function computeGraphMetrics(nodes: WikiNode[], links: WikiLink[]): GraphMetrics {
  const V = nodes.length;
  const E = links.length;

  if (V === 0) {
    return {
      nodeCount: 0,
      edgeCount: 0,
      density: 0,
      avgDegree: 0,
      maxDegree: 0,
      connectedComponents: 0,
      degreeDistribution: [],
      topCentralityNodes: [],
      categoryDistribution: []
    };
  }

  // Density for undirected representation of graph
  const maxPossibleEdges = V > 1 ? (V * (V - 1)) / 2 : 1;
  const density = V > 1 ? Math.min(1, E / maxPossibleEdges) : 0;

  // Degrees
  let totalDegree = 0;
  let maxDegree = 0;
  const degreeFrequency: Record<number, number> = {};
  const categoryFreq: Record<string, number> = {};

  nodes.forEach(n => {
    const deg = n.degree;
    totalDegree += deg;
    if (deg > maxDegree) maxDegree = deg;

    degreeFrequency[deg] = (degreeFrequency[deg] || 0) + 1;
    categoryFreq[n.category] = (categoryFreq[n.category] || 0) + 1;
  });

  const avgDegree = V > 0 ? totalDegree / V : 0;

  // Degree distribution sorted
  const degreeDistribution = Object.keys(degreeFrequency)
    .map(d => ({
      degree: Number(d),
      count: degreeFrequency[Number(d)]
    }))
    .sort((a, b) => a.degree - b.degree);

  // Top centrality nodes
  const topCentralityNodes = [...nodes]
    .sort((a, b) => b.degree - a.degree)
    .slice(0, 10)
    .map(n => ({
      id: n.id,
      title: n.title,
      degree: n.degree,
      inDegree: n.inDegree,
      outDegree: n.outDegree,
      category: n.category
    }));

  // Category distribution
  const categoryDistribution = Object.keys(categoryFreq)
    .map(c => ({
      category: c,
      count: categoryFreq[c]
    }))
    .sort((a, b) => b.count - a.count);

  // Connected components via BFS
  const visited = new Set<string>();
  let connectedComponents = 0;

  // Build undirected adjacency list for component analysis
  const adj = new Map<string, string[]>();
  nodes.forEach(n => adj.set(n.id, []));
  links.forEach(l => {
    const sId = typeof l.source === 'object' ? (l.source as WikiNode).id : l.source;
    const tId = typeof l.target === 'object' ? (l.target as WikiNode).id : l.target;
    if (adj.has(sId) && adj.has(tId)) {
      adj.get(sId)!.push(tId);
      adj.get(tId)!.push(sId);
    }
  });

  nodes.forEach(n => {
    if (!visited.has(n.id)) {
      connectedComponents++;
      const queue = [n.id];
      visited.add(n.id);

      while (queue.length > 0) {
        const curr = queue.shift()!;
        const neighbors = adj.get(curr) || [];
        for (const neighbor of neighbors) {
          if (!visited.has(neighbor)) {
            visited.add(neighbor);
            queue.push(neighbor);
          }
        }
      }
    }
  });

  return {
    nodeCount: V,
    edgeCount: E,
    density: Number(density.toFixed(4)),
    avgDegree: Number(avgDegree.toFixed(2)),
    maxDegree,
    connectedComponents,
    degreeDistribution,
    topCentralityNodes,
    categoryDistribution
  };
}

/**
 * Breadth-First Search (BFS) to find the shortest path between source and target articles.
 * Considers both directed and reverse exploration options for comprehensive exploration.
 */
export function findShortestPathBFS(
  sourceId: string,
  targetId: string,
  nodes: WikiNode[],
  links: WikiLink[],
  directed: boolean = false
): PathFindingResult {
  const startTime = performance.now();

  if (!sourceId || !targetId) {
    return {
      path: [],
      nodes: [],
      hops: 0,
      visitedCount: 0,
      executionTimeMs: 0,
      found: false,
      message: 'Source and Target articles are required.'
    };
  }

  if (sourceId.toLowerCase() === targetId.toLowerCase()) {
    const node = nodes.find(n => n.id.toLowerCase() === sourceId.toLowerCase());
    return {
      path: [sourceId],
      nodes: node ? [node] : [],
      hops: 0,
      visitedCount: 1,
      executionTimeMs: Number((performance.now() - startTime).toFixed(2)),
      found: true,
      message: 'Source and Target are the same article.'
    };
  }

  // Node existence check
  const nodeMap = new Map<string, WikiNode>();
  nodes.forEach(n => nodeMap.set(n.id, n));

  const sourceNode = nodeMap.get(sourceId);
  const targetNode = nodeMap.get(targetId);

  if (!sourceNode || !targetNode) {
    return {
      path: [],
      nodes: [],
      hops: 0,
      visitedCount: 0,
      executionTimeMs: Number((performance.now() - startTime).toFixed(2)),
      found: false,
      message: 'One or both articles are not present in current graph.'
    };
  }

  // Build Adjacency List
  const adj = new Map<string, string[]>();
  nodes.forEach(n => adj.set(n.id, []));

  links.forEach(l => {
    const sId = typeof l.source === 'object' ? (l.source as WikiNode).id : l.source;
    const tId = typeof l.target === 'object' ? (l.target as WikiNode).id : l.target;

    if (adj.has(sId)) {
      adj.get(sId)!.push(tId);
    }
    if (!directed && adj.has(tId)) {
      adj.get(tId)!.push(sId);
    }
  });

  // Standard Queue BFS
  const queue: string[] = [sourceId];
  const visited = new Set<string>([sourceId]);
  const parent = new Map<string, string>();

  let found = false;

  while (queue.length > 0) {
    const current = queue.shift()!;

    if (current.toLowerCase() === targetId.toLowerCase()) {
      found = true;
      break;
    }

    const neighbors = adj.get(current) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        parent.set(neighbor, current);
        queue.push(neighbor);

        if (neighbor.toLowerCase() === targetId.toLowerCase()) {
          found = true;
          break;
        }
      }
    }

    if (found) break;
  }

  const executionTimeMs = Number((performance.now() - startTime).toFixed(2));

  if (!found) {
    return {
      path: [],
      nodes: [],
      hops: 0,
      visitedCount: visited.size,
      executionTimeMs,
      found: false,
      message: `No connection found between "${sourceId}" and "${targetId}" in the currently loaded graph.`
    };
  }

  // Reconstruct path
  const path: string[] = [];
  let curr: string | undefined = targetId;

  while (curr) {
    path.unshift(curr);
    if (curr === sourceId) break;
    curr = parent.get(curr);
  }

  const pathNodes = path.map(id => nodeMap.get(id)!).filter(Boolean);

  return {
    path,
    nodes: pathNodes,
    hops: Math.max(0, path.length - 1),
    visitedCount: visited.size,
    executionTimeMs,
    found: true,
    message: `Found shortest path with ${path.length - 1} hops (${pathNodes.length} articles traversed).`
  };
}

/**
 * Calculates node radius based on connection degree.
 */
export function getNodeRadius(degree: number, scaleMode: 'degree' | 'inDegree' | 'uniform' = 'degree'): number {
  if (scaleMode === 'uniform') return 9;
  const base = 7;
  const scaled = Math.sqrt(Math.max(1, degree)) * 4.2;
  return Math.min(36, Math.max(base, scaled));
}

/**
 * Determines node color based on active ColorMode
 */
export function getNodeColor(node: WikiNode, mode: 'depth' | 'category' | 'degree' | 'connectivity'): string {
  if (node.isPathStart) return '#22c55e'; // Green for Start
  if (node.isPathEnd) return '#f43f5e';   // Rose for Target
  if (node.isPathNode) return '#fbbf24';  // Amber/Gold for Path

  if (mode === 'category') {
    return CATEGORY_COLORS[node.category] || CATEGORY_COLORS['Default'];
  }

  if (mode === 'depth') {
    const depthColors = [
      '#38bdf8', // 0: sky (seed)
      '#818cf8', // 1: indigo
      '#c084fc', // 2: fuchsia
      '#f472b6', // 3: pink
      '#fb923c', // 4: orange
      '#94a3b8'  // 5+: slate
    ];
    return depthColors[Math.min(node.depth, depthColors.length - 1)];
  }

  if (mode === 'degree') {
    if (node.degree >= 15) return '#ef4444'; // Red (super-hub)
    if (node.degree >= 10) return '#f97316'; // Orange (hub)
    if (node.degree >= 6) return '#eab308';  // Yellow (high degree)
    if (node.degree >= 3) return '#3b82f6';  // Blue (medium)
    return '#64748b';                        // Slate (low)
  }

  // connectivity mode
  return node.expanded ? '#06b6d4' : '#64748b';
}
