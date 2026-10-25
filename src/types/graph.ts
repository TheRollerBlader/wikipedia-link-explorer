import { SimulationNodeDatum, SimulationLinkDatum } from 'd3';

export interface WikiNode extends SimulationNodeDatum {
  id: string; // Article title (unique identifier)
  title: string;
  degree: number;
  inDegree: number;
  outDegree: number;
  depth: number;
  category: string;
  summary?: string;
  thumbnail?: string;
  description?: string;
  url: string;
  expanded: boolean;
  loading?: boolean;
  pinned?: boolean;
  color?: string;
  isPathNode?: boolean;
  isPathStart?: boolean;
  isPathEnd?: boolean;
}

export interface WikiLink extends SimulationLinkDatum<WikiNode> {
  source: string | WikiNode;
  target: string | WikiNode;
  isPath?: boolean;
  weight?: number;
}

export interface GraphData {
  nodes: WikiNode[];
  links: WikiLink[];
}

export interface GraphMetrics {
  nodeCount: number;
  edgeCount: number;
  density: number;
  avgDegree: number;
  maxDegree: number;
  connectedComponents: number;
  degreeDistribution: { degree: number; count: number }[];
  topCentralityNodes: {
    id: string;
    title: string;
    degree: number;
    inDegree: number;
    outDegree: number;
    category: string;
  }[];
  categoryDistribution: { category: string; count: number }[];
}

export interface PathFindingResult {
  path: string[];
  nodes: WikiNode[];
  hops: number;
  visitedCount: number;
  executionTimeMs: number;
  found: boolean;
  message?: string;
}

export type ColorMode = 'depth' | 'category' | 'degree' | 'connectivity';
export type LabelVisibility = 'all' | 'central' | 'hover';

export interface SimulationConfig {
  charge: number;          // ManyBody force strength (e.g. -180 to -600)
  linkDistance: number;    // Link distance (e.g. 40 to 180)
  linkStrength: number;    // Link force strength (e.g. 0.1 to 1)
  collisionRadius: number; // Collision padding
  colorMode: ColorMode;
  labelVisibility: LabelVisibility;
  showArrows: boolean;
  particleSpeed: number;
}
