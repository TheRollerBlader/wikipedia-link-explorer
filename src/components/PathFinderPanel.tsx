import React, { useState } from 'react';
import { WikiNode, WikiLink, PathFindingResult } from '../types/graph';
import { findShortestPathBFS } from '../services/networkTheory';
import {
  Route,
  Zap,
  RotateCcw,
  Clock,
  Layers
} from 'lucide-react';

interface PathFinderPanelProps {
  nodes: WikiNode[];
  links: WikiLink[];
  sourceId: string;
  targetId: string;
  onSetSourceId: (id: string) => void;
  onSetTargetId: (id: string) => void;
  onHighlightPath: (path: string[]) => void;
  onSelectNode: (node: WikiNode) => void;
  onClose?: () => void;
}

export const PathFinderPanel: React.FC<PathFinderPanelProps> = ({
  nodes,
  links,
  sourceId,
  targetId,
  onSetSourceId,
  onSetTargetId,
  onHighlightPath,
  onSelectNode,
}) => {
  const [result, setResult] = useState<PathFindingResult | null>(null);
  const [isDirected, setIsDirected] = useState<boolean>(false);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  const handleFindPath = () => {
    if (!sourceId || !targetId) return;

    const res = findShortestPathBFS(sourceId, targetId, nodes, links, isDirected);
    setResult(res);

    if (res.found) {
      onHighlightPath(res.path);
    } else {
      onHighlightPath([]);
    }
  };

  const handleClearPath = () => {
    setResult(null);
    onHighlightPath([]);
  };

  const handleSwap = () => {
    const temp = sourceId;
    onSetSourceId(targetId);
    onSetTargetId(temp);
    if (result) {
      setResult(null);
      onHighlightPath([]);
    }
  };

  // Step-by-step path animation
  const handleAnimatePath = () => {
    if (!result || !result.found || result.path.length <= 1) return;

    setIsAnimating(true);
    let step = 1;
    const interval = setInterval(() => {
      if (step <= result.path.length) {
        onHighlightPath(result.path.slice(0, step));
        step++;
      } else {
        clearInterval(interval);
        setIsAnimating(false);
      }
    }, 450);
  };

  return (
    <div className="bg-[#0f172a]/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-4 shadow-2xl text-slate-200 space-y-4">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Route className="w-5 h-5 text-amber-400" />
          <h3 className="font-semibold text-sm text-white flex items-center gap-1.5">
            BFS Shortest Path Finder
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
              O(V + E)
            </span>
          </h3>
        </div>

        {/* Directed toggle */}
        <label className="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer">
          <input
            type="checkbox"
            checked={isDirected}
            onChange={e => setIsDirected(e.target.checked)}
            className="rounded bg-slate-800 border-slate-700 text-sky-500 focus:ring-0 w-3.5 h-3.5"
          />
          Directed Only
        </label>
      </div>

      {/* Selectors */}
      <div className="grid grid-cols-1 gap-2.5">
        {/* Source */}
        <div className="space-y-1">
          <label className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Origin Article
          </label>
          <select
            value={sourceId}
            onChange={e => onSetSourceId(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
          >
            <option value="">Select Origin Article...</option>
            {nodes.map(n => (
              <option key={`src-${n.id}`} value={n.id}>
                {n.title} (deg: {n.degree})
              </option>
            ))}
          </select>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center -my-1">
          <button
            onClick={handleSwap}
            title="Swap Origin and Target"
            className="px-2 py-0.5 text-[11px] font-mono text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-md border border-slate-700 transition-colors"
          >
            ⇄ Swap
          </button>
        </div>

        {/* Target */}
        <div className="space-y-1">
          <label className="text-[11px] font-mono text-rose-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-400" />
            Target Article
          </label>
          <select
            value={targetId}
            onChange={e => onSetTargetId(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
          >
            <option value="">Select Target Article...</option>
            {nodes.map(n => (
              <option key={`tgt-${n.id}`} value={n.id}>
                {n.title} (deg: {n.degree})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleFindPath}
          disabled={!sourceId || !targetId}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-semibold rounded-xl text-xs shadow-lg shadow-amber-950/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Zap className="w-4 h-4 fill-current" />
          Find Shortest Link Path
        </button>

        {result && (
          <button
            onClick={handleClearPath}
            title="Clear Path Highlight"
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs border border-slate-700 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Result Display */}
      {result && (
        <div className="space-y-3 bg-slate-900/80 border border-slate-800 p-3 rounded-xl animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-xs">
            <span
              className={`font-semibold ${
                result.found ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {result.found ? 'Path Found!' : 'No Path Found'}
            </span>
            <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-500" />
                {result.executionTimeMs}ms
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Layers className="w-3 h-3 text-slate-500" />
                {result.hops} hops
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-400">{result.message}</p>

          {/* Path Steps Breadcrumb */}
          {result.found && result.path.length > 0 && (
            <div className="space-y-2 pt-1 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">
                  Link Traversal Chain ({result.path.length} articles)
                </span>
                <button
                  onClick={handleAnimatePath}
                  disabled={isAnimating}
                  className="text-[11px] text-sky-400 hover:text-sky-300 font-medium flex items-center gap-1"
                >
                  ▶ {isAnimating ? 'Traversing...' : 'Play Traversal'}
                </button>
              </div>

              <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
                {result.nodes.map((node, index) => (
                  <div
                    key={`step-${node.id}-${index}`}
                    onClick={() => onSelectNode(node)}
                    className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 cursor-pointer text-xs group transition-colors"
                  >
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold font-mono ${
                        index === 0
                          ? 'bg-emerald-500 text-slate-950'
                          : index === result.nodes.length - 1
                          ? 'bg-rose-500 text-white'
                          : 'bg-amber-400 text-slate-950'
                      }`}
                    >
                      {index + 1}
                    </span>
                    <span className="font-medium text-slate-200 group-hover:text-amber-300 truncate">
                      {node.title}
                    </span>
                    <span className="text-[10px] text-slate-500 ml-auto font-mono">
                      {node.category}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
