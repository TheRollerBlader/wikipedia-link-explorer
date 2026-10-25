import React from 'react';
import { GraphMetrics } from '../types/graph';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import {
  Activity,
  TrendingUp,
  Award,
  CircleDot
} from 'lucide-react';
import { CATEGORY_COLORS } from '../services/offlineData';

interface TelemetryPanelProps {
  metrics: GraphMetrics;
  onSelectNodeById: (id: string) => void;
}

export const TelemetryPanel: React.FC<TelemetryPanelProps> = ({
  metrics,
  onSelectNodeById,
}) => {
  return (
    <div className="bg-[#0f172a]/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-4 shadow-2xl text-slate-200 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-sky-400" />
          <h3 className="font-semibold text-sm text-white">
            Network Telemetry & Analytics
          </h3>
        </div>
        <span className="text-[11px] font-mono text-slate-400 bg-slate-800/80 px-2.5 py-0.5 rounded-full border border-slate-700">
          {metrics.connectedComponents} {metrics.connectedComponents === 1 ? 'Component' : 'Components'}
        </span>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
          <span className="text-[10px] font-mono uppercase text-slate-400 block mb-0.5">
            Vertices (V)
          </span>
          <span className="text-xl font-bold font-mono text-sky-400">
            {metrics.nodeCount}
          </span>
        </div>

        <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
          <span className="text-[10px] font-mono uppercase text-slate-400 block mb-0.5">
            Edges (E)
          </span>
          <span className="text-xl font-bold font-mono text-indigo-400">
            {metrics.edgeCount}
          </span>
        </div>

        <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
          <span className="text-[10px] font-mono uppercase text-slate-400 block mb-0.5">
            Graph Density
          </span>
          <span className="text-xl font-bold font-mono text-emerald-400">
            {metrics.density}
          </span>
        </div>

        <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
          <span className="text-[10px] font-mono uppercase text-slate-400 block mb-0.5">
            Avg / Max Degree
          </span>
          <span className="text-xl font-bold font-mono text-amber-400">
            {metrics.avgDegree} <span className="text-xs text-slate-500 font-normal">/ {metrics.maxDegree}</span>
          </span>
        </div>
      </div>

      {/* Degree Distribution Chart (Recharts) */}
      <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-sky-400" />
            Degree Distribution P(k)
          </span>
          <span className="text-[10px] text-slate-500 font-mono">
            Scale-free power-law
          </span>
        </div>

        <div className="h-28 w-full">
          {metrics.degreeDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.degreeDistribution} margin={{ top: 4, right: 4, left: -25, bottom: 0 }}>
                <XAxis
                  dataKey="degree"
                  stroke="#64748b"
                  fontSize={10}
                  tickLine={false}
                  axisLine={{ stroke: '#334155' }}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={10}
                  tickLine={false}
                  axisLine={{ stroke: '#334155' }}
                  allowDecimals={false}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(56, 189, 248, 0.1)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-950/95 border border-slate-700 p-2 rounded-lg text-xs font-mono shadow-xl">
                          <p className="text-sky-400">Degree (k): {payload[0].payload.degree}</p>
                          <p className="text-slate-300">Articles: {payload[0].payload.count}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                  {metrics.degreeDistribution.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.degree >= 8 ? '#f59e0b' : entry.degree >= 4 ? '#38bdf8' : '#6366f1'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-500">
              No degree data available
            </div>
          )}
        </div>
      </div>

      {/* Centrality Leaderboard */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            Degree Centrality Hubs
          </span>
          <span className="text-[10px] text-slate-500 font-mono">
            Click to focus
          </span>
        </div>

        <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
          {metrics.topCentralityNodes.slice(0, 5).map((node, idx) => (
            <button
              key={`leader-${node.id}`}
              onClick={() => onSelectNodeById(node.id)}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/80 transition-colors text-xs text-left group"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-4 text-[10px] font-mono text-slate-500 group-hover:text-amber-400">
                  #{idx + 1}
                </span>
                <span className="text-slate-200 group-hover:text-white font-medium truncate">
                  {node.title}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 font-mono text-[11px]">
                <span className="text-sky-400 font-bold">
                  {node.degree} <span className="text-[9px] text-slate-500 font-normal">links</span>
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Category Distribution */}
      {metrics.categoryDistribution.length > 0 && (
        <div className="pt-2 border-t border-slate-800 flex flex-wrap gap-1.5">
          {metrics.categoryDistribution.slice(0, 6).map(c => {
            const col = CATEGORY_COLORS[c.category] || CATEGORY_COLORS['Default'];
            return (
              <span
                key={`cat-${c.category}`}
                className="px-2 py-0.5 rounded-full text-[10px] font-mono flex items-center gap-1"
                style={{
                  backgroundColor: `${col}15`,
                  color: col,
                  border: `1px solid ${col}40`
                }}
              >
                <CircleDot className="w-2.5 h-2.5" />
                {c.category}: {c.count}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
};
