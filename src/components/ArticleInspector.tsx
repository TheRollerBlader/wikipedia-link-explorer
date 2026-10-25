import React from 'react';
import { WikiNode, WikiLink } from '../types/graph';
import { CATEGORY_COLORS } from '../services/offlineData';
import {
  X,
  ExternalLink,
  PlusCircle,
  MapPin,
  PinOff,
  Navigation,
  Layers,
  ArrowDownLeft,
  ArrowUpRight,
  BookOpen
} from 'lucide-react';

interface ArticleInspectorProps {
  node: WikiNode | null;
  links: WikiLink[];
  allNodes: WikiNode[];
  onClose: () => void;
  onExpand: (node: WikiNode) => void;
  onSelectNode: (node: WikiNode) => void;
  onSetPathStart: (nodeId: string) => void;
  onSetPathEnd: (nodeId: string) => void;
  onTogglePin: (node: WikiNode) => void;
}

export const ArticleInspector: React.FC<ArticleInspectorProps> = ({
  node,
  links,
  allNodes,
  onClose,
  onExpand,
  onSelectNode,
  onSetPathStart,
  onSetPathEnd,
  onTogglePin,
}) => {
  if (!node) return null;

  const categoryColor = CATEGORY_COLORS[node.category] || CATEGORY_COLORS['Default'];

  // Find incoming and outgoing neighbors in current graph
  const nodeMap = new Map(allNodes.map(n => [n.id, n]));
  const outgoingNeighbors: WikiNode[] = [];
  const incomingNeighbors: WikiNode[] = [];

  links.forEach(l => {
    const sId = typeof l.source === 'object' ? (l.source as WikiNode).id : l.source;
    const tId = typeof l.target === 'object' ? (l.target as WikiNode).id : l.target;

    if (sId === node.id && nodeMap.has(tId)) {
      outgoingNeighbors.push(nodeMap.get(tId)!);
    }
    if (tId === node.id && nodeMap.has(sId)) {
      incomingNeighbors.push(nodeMap.get(sId)!);
    }
  });

  return (
    <aside className="fixed top-20 right-4 bottom-6 w-96 z-40 bg-[#0f172a]/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-200 animate-in slide-in-from-right-8 duration-200">
      {/* Drawer Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-sky-400" />
          <span className="text-xs font-mono tracking-wider uppercase text-slate-400">
            Article Inspector
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Drawer Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Thumbnail & Title */}
        <div className="space-y-3">
          {node.thumbnail && (
            <div className="w-full h-44 rounded-xl overflow-hidden border border-slate-700/80 bg-slate-900 relative group">
              <img
                src={node.thumbnail}
                alt={node.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          )}

          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span
                className="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide"
                style={{
                  backgroundColor: `${categoryColor}20`,
                  color: categoryColor,
                  border: `1px solid ${categoryColor}60`
                }}
              >
                {node.category}
              </span>
              <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                Depth {node.depth}
              </span>
              {node.pinned && (
                <span className="text-xs font-mono text-amber-400 flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                  <MapPin className="w-3 h-3" /> Pinned
                </span>
              )}
            </div>

            <h2 className="text-xl font-bold text-white leading-snug">
              {node.title}
            </h2>

            {node.description && (
              <p className="text-sm text-slate-400 italic mt-1">
                {node.description}
              </p>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          <button
            onClick={() => onExpand(node)}
            disabled={node.loading}
            className="flex items-center justify-center gap-2 px-3 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-medium shadow-lg shadow-sky-900/30 transition-all disabled:opacity-50"
          >
            <PlusCircle className="w-4 h-4" />
            {node.loading ? 'Expanding...' : 'Expand Outward'}
          </button>

          <a
            href={node.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium border border-slate-700 transition-colors"
          >
            <ExternalLink className="w-4 h-4 text-sky-400" />
            Wikipedia
          </a>

          <button
            onClick={() => onSetPathStart(node.id)}
            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-950/60 hover:bg-emerald-900/70 text-emerald-300 border border-emerald-800/60 rounded-xl text-xs font-medium transition-colors"
          >
            <Navigation className="w-3.5 h-3.5 text-emerald-400" />
            Set as Path Start
          </button>

          <button
            onClick={() => onSetPathEnd(node.id)}
            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-rose-950/60 hover:bg-rose-900/70 text-rose-300 border border-rose-800/60 rounded-xl text-xs font-medium transition-colors"
          >
            <Navigation className="w-3.5 h-3.5 text-rose-400" />
            Set as Path Target
          </button>
        </div>

        {/* Pin Button */}
        <button
          onClick={() => onTogglePin(node)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-slate-700/80 rounded-xl text-xs font-medium transition-colors"
        >
          {node.pinned ? (
            <>
              <PinOff className="w-3.5 h-3.5 text-amber-400" />
              Unpin from Canvas Position
            </>
          ) : (
            <>
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              Pin Node at Current Position
            </>
          )}
        </button>

        {/* Article Summary Extract */}
        {node.summary && (
          <div className="space-y-1.5 bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
            <h4 className="text-xs font-mono uppercase text-slate-400 tracking-wider">
              Summary Extract
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed max-h-48 overflow-y-auto">
              {node.summary}
            </p>
          </div>
        )}

        {/* Centrality & Degree Stats */}
        <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-2.5">
          <h4 className="text-xs font-mono uppercase text-slate-400 tracking-wider">
            Network Centrality
          </h4>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-slate-800/60 p-2 rounded-lg border border-slate-700/60">
              <span className="text-[10px] text-slate-400 block">Total Degree</span>
              <span className="text-base font-bold text-sky-400 font-mono">
                {node.degree}
              </span>
            </div>
            <div className="bg-slate-800/60 p-2 rounded-lg border border-slate-700/60">
              <span className="text-[10px] text-slate-400 block">In-Degree</span>
              <span className="text-base font-bold text-emerald-400 font-mono">
                {node.inDegree}
              </span>
            </div>
            <div className="bg-slate-800/60 p-2 rounded-lg border border-slate-700/60">
              <span className="text-[10px] text-slate-400 block">Out-Degree</span>
              <span className="text-base font-bold text-indigo-400 font-mono">
                {node.outDegree}
              </span>
            </div>
          </div>
        </div>

        {/* Linked Neighbors In Current Graph */}
        <div className="space-y-2">
          <h4 className="text-xs font-mono uppercase text-slate-400 tracking-wider flex items-center justify-between">
            <span>Linked Articles In Graph</span>
            <span className="text-slate-500">
              {outgoingNeighbors.length + incomingNeighbors.length}
            </span>
          </h4>

          {outgoingNeighbors.length === 0 && incomingNeighbors.length === 0 ? (
            <p className="text-xs text-slate-500 italic">
              No links to other nodes currently on canvas. Click "Expand Outward" to reveal connections!
            </p>
          ) : (
            <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
              {outgoingNeighbors.map(n => (
                <button
                  key={`out-${n.id}`}
                  onClick={() => onSelectNode(n)}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 bg-slate-800/50 hover:bg-slate-800 text-left rounded-lg text-xs text-slate-300 hover:text-white transition-colors border border-slate-800"
                >
                  <span className="truncate">{n.title}</span>
                  <span className="text-[10px] font-mono text-indigo-400 flex items-center gap-0.5">
                    out <ArrowUpRight className="w-3 h-3" />
                  </span>
                </button>
              ))}
              {incomingNeighbors.map(n => (
                <button
                  key={`in-${n.id}`}
                  onClick={() => onSelectNode(n)}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 bg-slate-800/50 hover:bg-slate-800 text-left rounded-lg text-xs text-slate-300 hover:text-white transition-colors border border-slate-800"
                >
                  <span className="truncate">{n.title}</span>
                  <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-0.5">
                    in <ArrowDownLeft className="w-3 h-3" />
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
