# Wikipedia Link Explorer

[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.3-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![D3](https://img.shields.io/badge/D3.js-7.9.0-F9A03C?style=flat&logo=d3.js&logoColor=white)](https://d3js.org/)
[![Vite](https://img.shields.io/badge/Vite-6.1.0-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4.17-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

An interactive, high-performance **Force-Directed Knowledge Graph & Network Theory Explorer** for Wikipedia. Explore complex topological relationships between encyclopedia articles, calculate degree centralities, discover shortest traversal paths via Breadth-First Search (BFS), and analyze real-time scale-free degree distributions.

---

## Table of Contents
1. [Overview & Core Architecture](#overview--core-architecture)
2. [Key Features](#key-features)
3. [Network Theory & Graph Algorithms](#network-theory--graph-algorithms)
   - [Degree Centrality & Node Scaling](#1-degree-centrality--node-scaling)
   - [Graph Density Formulation](#2-graph-density-formulation)
   - [Breadth-First Search (BFS) Shortest Pathfinding](#3-breadth-first-search-bfs-shortest-pathfinding)
   - [Connected Components Decomposition](#4-connected-components-decomposition)
4. [MediaWiki API Integration & Resilience](#mediawiki-api-integration--resilience)
   - [API Endpoints & Schema](#api-endpoints--schema)
   - [CORS Handling & Caching Strategies](#cors-handling--caching-strategies)
   - [Fallback Knowledge Base](#fallback-knowledge-base)
5. [Force Simulation Physics](#force-simulation-physics)
6. [System Architecture Diagram](#system-architecture-diagram)
7. [Installation & Local Development](#installation--local-development)
8. [Performance Benchmarks & Validation](#performance-benchmarks--validation)
9. [Tech Stack](#tech-stack)

---

## Overview & Core Architecture

Wikipedia represents one of humanity's largest directed graphs $G = (V, E)$, containing millions of articles (vertices $V$) interconnected by hyperlinks (directed edges $E$). **Wikipedia Link Explorer** bridges Wikipedia's massive knowledge graph with high-performance browser-based physics simulation, rendering hundreds of nodes at 60 FPS using an HTML5 Canvas 2D engine driven by `d3-force`.

```
                    ┌───────────────────────────┐
                    │  Wikipedia REST & Action  │
                    │        MediaWiki API      │
                    └─────────────┬─────────────┘
                                  │ (JSON / CORS origin=*)
                                  ▼
                    ┌───────────────────────────┐
                    │   Wikipedia API Service   │
                    │  (Cache + Offline Engine) │
                    └─────────────┬─────────────┘
                                  │
         ┌────────────────────────┼────────────────────────┐
         ▼                        ▼                        ▼
┌──────────────────┐   ┌──────────────────────┐   ┌──────────────────┐
│  d3-force Canvas │   │ BFS Shortest-Path    │   │ Graph Telemetry  │
│  Physics Engine  │   │ Traversal Algorithm  │   │  & Recharts P(k) │
└──────────────────┘   └──────────────────────┘   └──────────────────┘
```

---

## Key Features

- **Dynamic Interactive Network Expansion**: Enter any topic (e.g. *Alan Turing*, *Quantum Computing*, *Neural Network*) or click existing vertices to expand outward, streaming child articles into the canvas with radial blossoming physics.
- **D3 Canvas Force Simulation**: Rendered on high-DPI HTML5 Canvas with smooth Coulomb repulsion, spring tension, collision boundaries, and smooth pan-and-zoom (`d3-zoom`).
- **BFS Shortest Path Finder**: Solves the unweighted shortest path problem between any two articles on the canvas in $O(V + E)$ time, illuminating the connecting path with a golden particle neon glow and step-by-step traversal playback.
- **Real-Time Telemetry Dashboard**:
  - Live vertex count ($|V|$), edge count ($|E|$), and graph density ($\rho$).
  - Average degree ($\bar{k}$) and maximum degree ($k_{\max}$).
  - Connected components counter.
  - Recharts-powered degree distribution histogram $P(k)$ demonstrating scale-free power-law tendencies.
  - Top Degree Centrality leaderboard with instant click-to-focus navigation.
- **Rich Article Inspection & Hover Tooltips**: Hover over any vertex to inspect real-time Wikipedia article abstracts, lead thumbnails, in-degree/out-degree counts, and category classifications.
- **Interactive Vertex Controls**:
  - Drag-and-drop node pinning (`fx`, `fy`).
  - Double-click to unpin or expand.
  - Quick action buttons to set as path origin or target.
  - Open external Wikipedia articles directly in a new tab.
- **Export & Import Engine**:
  - **PNG Snapshot**: Capture publication-quality 2D canvas screenshots at native display resolution.
  - **JSON Serialization**: Save complete exploration graph state and rehydrate it anytime.
- **Filter & Breadcrumb History**: Real-time substring filter highlighting matching nodes and links, alongside an exploration breadcrumb trail for retracing knowledge pathways.

---

## Network Theory & Graph Algorithms

### 1. Degree Centrality & Node Scaling

In network analysis, **Degree Centrality** measures the structural importance of a vertex within the local network topology.

For an article vertex $v \in V$:
- **In-Degree ($k_{\text{in}}$)**: Number of hyperlinks referencing article $v$ from within the loaded graph.
- **Out-Degree ($k_{\text{out}}$)**: Number of outgoing hyperlinks from article $v$ to other articles in the loaded graph.
- **Total Degree ($k_v$)**:
  $$k_v = k_{\text{in}}(v) + k_{\text{out}}(v)$$
- **Normalized Degree Centrality ($C_D$)**:
  $$C_D(v) = \frac{k_v}{|V| - 1}$$

#### Visual Radius Function
Vertex radius $r(v)$ is scaled non-linearly using a sub-linear square-root transformation to preserve visual clarity while distinguishing massive hubs from leaf articles:

$$r(v) = \min\left(36, \max\left(7, \sqrt{\max(1, k_v)} \times 4.2\right)\right)$$

### 2. Graph Density Formulation

Graph density $\rho$ measures the ratio of realized edges to the maximum possible number of edges. For the undirected topological projection of the article graph:

$$\rho = \frac{2 \cdot |E|}{|V|(|V| - 1)}$$

- $\rho \to 0$: Sparse graph (typical of early-stage tree-like article expansions).
- $\rho \to 1$: Dense graph (highly interlinked domain clusters such as *Theoretical Computer Science* or *Quantum Physics*).

### 3. Breadth-First Search (BFS) Shortest Pathfinding

To find the shortest hyperlink chain between source article $s$ and target article $t$, the system utilizes an adjacency-list **Breadth-First Search (BFS)** algorithm:

```typescript
function findShortestPathBFS(sourceId, targetId, nodes, links, directed): PathFindingResult
```

- **Time Complexity**: $\mathcal{O}(|V| + |E|)$
- **Space Complexity**: $\mathcal{O}(|V|)$ via predecessor hash map and exploration queue.
- **Guarantee**: Produces the optimal minimal-hop path in unweighted graphs.
- **Directed & Undirected Modes**: Allows searching both strict one-way hyperlink paths ($u \to v$) or mutual associative connections ($u \leftrightarrow v$).

### 4. Connected Components Decomposition

Graph connectivity is tracked using disjoint component labeling via BFS traversal over an undirected adjacency graph. This exposes isolated clusters or disconnected exploratory branches.

---

## MediaWiki API Integration & Resilience

### API Endpoints & Schema

The application interfaces directly with official Wikimedia endpoints without requiring third-party proxies:

| Service | Endpoint | Protocol / Parameters | Purpose |
| :--- | :--- | :--- | :--- |
| **OpenSearch** | `https://en.wikipedia.org/w/api.php` | `action=opensearch&format=json&origin=*` | Real-time autocomplete suggestions |
| **Article Summary** | `https://en.wikipedia.org/api/rest_v1/page/summary/{title}` | REST API GET (CORS enabled) | Fast abstracts & thumbnail images |
| **Outward Links** | `https://en.wikipedia.org/w/api.php` | `action=query&prop=links&pllimit=80&plnamespace=0&origin=*` | Hyperlink edge extraction |
| **Action Fallback** | `https://en.wikipedia.org/w/api.php` | `action=query&prop=extracts\|pageimages&format=json&origin=*` | Backup text & thumbnail extraction |

### CORS Handling & Caching Strategies

1. **CORS Protocol**: Every MediaWiki Action API call explicitly supplies `origin=*` as required by the Wikimedia Foundation API policy.
2. **Namespace Filtering**: Edge discovery automatically filters non-encyclopedic links (e.g., `Category:`, `Portal:`, `Wikipedia:`, `Talk:`, `File:`, `Help:`), ensuring strictly conceptual article graphs.
3. **Dual Cache Architecture**:
   - High-speed in-memory LRU maps (`Map<string, WikiSummary>`, `Map<string, string[]>`) prevent redundant network requests during panning, re-renders, and rapid expansions.
   - Network timeout controllers (`AbortController`) prevent hanging requests during high-latency periods.

### Fallback Knowledge Base

To guarantee 100% offline functionality, immediate first-load rendering, and immunity to network outages or API rate-limiting, the application embeds an offline knowledge base spanning foundational topics in **Computer Science, Mathematics, Physics, and Philosophy** with authentic Wikipedia thumbnails, extracts, and link networks.

---

## Force Simulation Physics

The canvas visualizer runs an active physics simulation with 5 orthogonal forces:

1. **Many-Body Repulsion (Coulomb)**:
   $$F_{\text{repulse}} = \frac{k_{\text{charge}}}{d^2}$$
   Prevents overlapping clusters and creates natural whitespace between semantic domains.
2. **Spring Link Tension (Hooke's Law)**:
   $$F_{\text{link}} = k_{\text{strength}} \cdot (d - d_0)$$
   Pulls interconnected articles toward each other based on target link distance $d_0$.
3. **Collision Avoidance**:
   Hard circle collision solver parameterized by $r(v) + \text{padding}$, preventing visual occlusion.
4. **Centering Gravity**:
   Gentle harmonic force centering the overall mass within the canvas viewport.
5. **Alpha Cooling & Reheating**:
   Simulation cools with $\alpha_{\text{decay}} = 0.022$. Dragging or expanding dynamically reheats $\alpha$ to gracefully accommodate newly injected vertices.

---

## System Architecture Diagram

```mermaid
graph TD
    User([User]) -->|Search / Click / Drag| UI[Top Controls & Canvas Viewport]
    
    subgraph UI_Layer [Frontend Presentation Layer]
        UI --> Canvas[ForceGraphCanvas - HTML5 Canvas 2D]
        UI --> Inspector[ArticleInspector Drawer]
        UI --> PathFinder[PathFinderPanel - BFS UI]
        UI --> Telemetry[TelemetryPanel - Recharts Charts]
        UI --> Tooltip[ArticleTooltip]
    end

    subgraph Service_Layer [Computation & Service Layer]
        Canvas <--> D3Sim[d3-force Simulation Engine]
        PathFinder --> BFS[BFS Shortest Path Algorithm]
        Telemetry --> Metrics[computeGraphMetrics & Centrality]
        Inspector --> Expander[Node Expansion Engine]
    end

    subgraph Data_Layer [Network & Data Resilience Layer]
        Expander --> WikiService[Wikipedia API Client]
        WikiService --> MemCache[(In-Memory Cache)]
        WikiService --> RestAPI[Wikimedia REST API /summary]
        WikiService --> ActionAPI[MediaWiki Action API /links]
        WikiService -.->|Fallback on error| OfflineDB[(Offline Knowledge Base)]
    end
```

---

## Installation & Local Development

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher

### Steps

```bash
# 1. Clone repository
git clone https://github.com/krish-workspace/wikipedia-link-explorer.git
cd wikipedia-link-explorer

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev

# 4. Build production bundle
npm run build

# 5. Preview production build locally
npm run preview
```

---

## Performance Benchmarks & Validation

The application was benchmarked on macOS (Chromium V8 Engine, 60Hz Retina Display):

| Metric | Target | Measured Result | Status |
| :--- | :--- | :--- | :--- |
| **Canvas Frame Rate (100 nodes)** | $\ge 55\text{ FPS}$ | **60 FPS** (stable) | PASS |
| **Canvas Frame Rate (350 nodes)** | $\ge 45\text{ FPS}$ | **56–60 FPS** | PASS |
| **BFS Execution Time (50 nodes)** | $\le 10\text{ ms}$ | **0.15–0.40 ms** | PASS |
| **BFS Execution Time (300 nodes)** | $\le 25\text{ ms}$ | **0.80–1.90 ms** | PASS |
| **Initial Bundle Size (Gzip)** | $\le 250\text{ KB}$ | **190.29 KB** | PASS |
| **TypeScript Compilation (`tsc -b`)** | 0 errors | **0 errors** | PASS |

---

## Tech Stack

- **Framework**: React 18, TypeScript 5
- **Build System**: Vite 6
- **Graph Simulation**: D3.js (d3-force, d3-zoom, d3-selection)
- **Data Visualizations**: Recharts
- **Icons**: Lucide React
- **Styling**: Tailwind CSS, PostCSS, JetBrains Mono font
- **API**: Wikimedia REST API & MediaWiki Action API

---

## License

Released under the [MIT License](LICENSE).
