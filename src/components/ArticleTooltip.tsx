import React from 'react';
import { WikiNode } from '../types/graph';
import { CATEGORY_COLORS } from '../services/offlineData';
import { GitBranch, ArrowDownLeft, ArrowUpRight } from 'lucide-react';

interface ArticleTooltipProps {
  node: WikiNode | null;
  coords: { x: number; y: number } | null;
}

export const ArticleTooltip: React.FC<ArticleTooltipProps> = ({ node, coords }) => {
  if (!node || !coords) return null;

  const categoryColor = CATEGORY_COLORS[node.category] || CATEGORY_COLORS['Default'];

  // Keep tooltip on screen
  const x = Math.min(coords.x + 16, window.innerWidth - 340);
  const y = Math.min(coords.y + 16, window.innerHeight - 280);

  return (
    <div
      style={{ left: `${x}px`, top: `${y}px` }}
      className="fixed z-50 pointer-events-none w-80 bg-[#0f172a]/95 backdrop-blur-md border border-slate-700/80 rounded-xl p-3.5 shadow-2xl transition-all duration-75 text-slate-200"
    >
      <div className="flex gap-3">
        {node.thumbnail ? (
          <img
            src={node.thumbnail}
            alt={node.title}
            className="w-16 h-16 rounded-lg object-cover bg-slate-800 border border-slate-700 flex-shrink-0"
          />
        ) : (
          <div className="w-16 h-16 rounded-lg bg-slate-800/80 border border-slate-700 flex items-center justify-center flex-shrink-0 text-slate-500 font-mono text-xs">
            Wiki
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <span
              className="px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide uppercase"
              style={{ backgroundColor: `${categoryColor}25`, color: categoryColor, border: `1px solid ${categoryColor}50` }}
            >
              {node.category}
            </span>
            <span className="text-[10px] text-slate-500 font-mono ml-auto">
              Depth {node.depth}
            </span>
          </div>

          <h4 className="font-semibold text-sm text-white truncate leading-tight">
            {node.title}
          </h4>

          {node.description && (
            <p className="text-xs text-slate-400 line-clamp-1 italic mt-0.5">
              {node.description}
            </p>
          )}
        </div>
      </div>

      {node.summary && (
        <p className="text-xs text-slate-300 mt-2.5 line-clamp-3 leading-relaxed border-t border-slate-800/80 pt-2">
          {node.summary}
        </p>
      )}

      {/* Degrees footer */}
      <div className="flex items-center justify-between text-xs font-mono text-slate-400 mt-3 pt-2 border-t border-slate-800/80">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-sky-400" title="Total connections">
            <GitBranch className="w-3.5 h-3.5" />
            {node.degree}
          </span>
          <span className="flex items-center gap-1 text-emerald-400" title="Inbound links">
            <ArrowDownLeft className="w-3.5 h-3.5" />
            {node.inDegree}
          </span>
          <span className="flex items-center gap-1 text-indigo-400" title="Outbound links">
            <ArrowUpRight className="w-3.5 h-3.5" />
            {node.outDegree}
          </span>
        </div>

        <div className="text-[10px] text-slate-500">
          Click to inspect
        </div>
      </div>
    </div>
  );
};
