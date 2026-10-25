import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Sliders,
  RotateCcw,
  Download,
  Upload,
  Globe,
  Sparkles,
  Route,
  Activity,
  ChevronRight
} from 'lucide-react';
import { searchWikipediaArticles, WikiSearchResult } from '../services/wikipediaApi';
import { SimulationConfig, ColorMode, LabelVisibility } from '../types/graph';

interface ControlsHeaderProps {
  onSearchTopic: (topic: string) => void;
  graphFilterQuery: string;
  onSetGraphFilterQuery: (q: string) => void;
  config: SimulationConfig;
  onUpdateConfig: (newConfig: Partial<SimulationConfig>) => void;
  onResetGraph: () => void;
  onExportJSON: () => void;
  onImportJSON: (file: File) => void;
  historyTrail: string[];
  onSelectHistoryTopic: (topic: string) => void;
  isPathFinderOpen: boolean;
  onTogglePathFinder: () => void;
  isTelemetryOpen: boolean;
  onToggleTelemetry: () => void;
}

export const ControlsHeader: React.FC<ControlsHeaderProps> = ({
  onSearchTopic,
  graphFilterQuery,
  onSetGraphFilterQuery,
  config,
  onUpdateConfig,
  onResetGraph,
  onExportJSON,
  onImportJSON,
  historyTrail,
  onSelectHistoryTopic,
  isPathFinderOpen,
  onTogglePathFinder,
  isTelemetryOpen,
  onToggleTelemetry,
}) => {
  const [topicInput, setTopicInput] = useState<string>('');
  const [suggestions, setSuggestions] = useState<WikiSearchResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const searchContainerRef = useRef<HTMLDivElement | null>(null);

  // Debounced search suggestions
  useEffect(() => {
    if (!topicInput.trim()) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      const res = await searchWikipediaArticles(topicInput);
      setSuggestions(res);
      setShowSuggestions(true);
    }, 280);

    return () => clearTimeout(timer);
  }, [topicInput]);

  // Click outside to dismiss suggestions
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTopicSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topicInput.trim()) {
      onSearchTopic(topicInput.trim());
      setShowSuggestions(false);
    }
  };

  const handleSelectSuggestion = (title: string) => {
    setTopicInput(title);
    setShowSuggestions(false);
    onSearchTopic(title);
  };

  const PRESETS = [
    'Alan Turing',
    'Artificial intelligence',
    'Graph theory',
    'Internet',
    'Quantum computing'
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-30 bg-[#080c14]/90 backdrop-blur-xl border-b border-slate-800 px-4 py-2.5 flex flex-col gap-2 shadow-lg">
      <div className="flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-sky-500/20">
            <Globe className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
              Wikipedia Link Explorer
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
                v1.0
              </span>
            </h1>
            <p className="text-[10px] text-slate-400 hidden sm:block">
              Force-directed knowledge graph & network theory explorer
            </p>
          </div>
        </div>

        {/* Global Wikipedia Article Topic Search Input */}
        <div ref={searchContainerRef} className="relative flex-1 max-w-md">
          <form onSubmit={handleTopicSubmit} className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={topicInput}
              onChange={e => setTopicInput(e.target.value)}
              onFocus={() => {
                if (suggestions.length > 0) setShowSuggestions(true);
              }}
              placeholder="Enter Wikipedia topic (e.g. Alan Turing, Neural network)..."
              className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-9 pr-20 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 shadow-inner"
            />
            <button
              type="submit"
              className="absolute right-1.5 px-2.5 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-[11px] font-medium transition-colors"
            >
              Explore
            </button>
          </form>

          {/* Autocomplete Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-[#0f172a] border border-slate-700/90 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in duration-150">
              <div className="p-1.5 text-[10px] font-mono uppercase text-slate-500 border-b border-slate-800">
                MediaWiki Autocomplete Matches
              </div>
              <div className="max-h-60 overflow-y-auto">
                {suggestions.map((s, idx) => (
                  <button
                    key={`sug-${idx}`}
                    onClick={() => handleSelectSuggestion(s.title)}
                    className="w-full text-left px-3 py-2 hover:bg-slate-800/80 transition-colors flex flex-col border-b border-slate-800/40 last:border-0"
                  >
                    <span className="text-xs font-medium text-slate-200">
                      {s.title}
                    </span>
                    {s.snippet && (
                      <span className="text-[11px] text-slate-400 truncate max-w-md">
                        {s.snippet}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Controls & Modal Toggles */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* In-Graph Filter */}
          <div className="relative hidden md:block w-36">
            <input
              type="text"
              value={graphFilterQuery}
              onChange={e => onSetGraphFilterQuery(e.target.value)}
              placeholder="Filter graph..."
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-300 placeholder-slate-500 focus:outline-none focus:border-slate-600"
            />
          </div>

          {/* Toggle Shortest Path */}
          <button
            onClick={onTogglePathFinder}
            title="BFS Shortest Path Finder"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              isPathFinderOpen
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700'
            }`}
          >
            <Route className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Pathfinder</span>
          </button>

          {/* Toggle Telemetry */}
          <button
            onClick={onToggleTelemetry}
            title="Graph Telemetry & Metrics"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              isTelemetryOpen
                ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Telemetry</span>
          </button>

          {/* Settings / Physics Config Toggle */}
          <button
            onClick={() => setShowSettingsModal(!showSettingsModal)}
            title="Physics Simulation & Color Settings"
            className={`p-1.5 rounded-lg text-slate-300 hover:text-white border transition-colors ${
              showSettingsModal
                ? 'bg-slate-800 border-slate-600 text-sky-400'
                : 'bg-slate-900 hover:bg-slate-800 border-slate-700'
            }`}
          >
            <Sliders className="w-4 h-4" />
          </button>

          {/* Export JSON */}
          <button
            onClick={onExportJSON}
            title="Export Graph to JSON"
            className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Import JSON */}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".json"
            onChange={e => {
              const file = e.target.files?.[0];
              if (file) {
                onImportJSON(file);
                e.target.value = '';
              }
            }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            title="Import Graph from JSON"
            className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 rounded-lg transition-colors"
          >
            <Upload className="w-4 h-4" />
          </button>

          {/* Reset Graph */}
          <button
            onClick={onResetGraph}
            title="Reset to Initial Graph"
            className="p-1.5 bg-slate-900 hover:bg-slate-800 text-rose-400 hover:text-rose-300 border border-slate-700 rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Sub-bar: Presets & Breadcrumb history */}
      <div className="flex items-center justify-between text-xs overflow-x-auto gap-4 pt-0.5">
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="text-[11px] font-mono text-slate-500 uppercase flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-sky-400" /> Presets:
          </span>
          {PRESETS.map(preset => (
            <button
              key={`preset-${preset}`}
              onClick={() => onSearchTopic(preset)}
              className="px-2 py-0.5 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-sky-300 rounded-md border border-slate-800 text-[11px] transition-colors"
            >
              {preset}
            </button>
          ))}
        </div>

        {/* Exploration Breadcrumb Trail */}
        {historyTrail.length > 0 && (
          <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400 overflow-x-auto max-w-md ml-auto">
            <span className="text-slate-600 uppercase text-[10px]">Trail:</span>
            {historyTrail.slice(-4).map((topic, idx, arr) => (
              <React.Fragment key={`trail-${topic}-${idx}`}>
                <button
                  onClick={() => onSelectHistoryTopic(topic)}
                  className="hover:text-sky-400 underline decoration-slate-700 underline-offset-2 truncate max-w-[120px]"
                >
                  {topic}
                </button>
                {idx < arr.length - 1 && (
                  <ChevronRight className="w-3 h-3 text-slate-600 flex-shrink-0" />
                )}
              </React.Fragment>
            ))}
          </div>
        )}
      </div>

      {/* Physics & Visualization Settings Modal Popover */}
      {showSettingsModal && (
        <div className="absolute top-full right-4 mt-2 w-80 bg-[#0f172a]/95 backdrop-blur-xl border border-slate-700 rounded-2xl p-4 shadow-2xl z-50 text-slate-200 space-y-3.5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h4 className="font-semibold text-xs uppercase font-mono tracking-wider text-white">
              Physics & Simulation Config
            </h4>
            <button
              onClick={() => setShowSettingsModal(false)}
              className="text-slate-400 hover:text-white text-xs"
            >
              Done
            </button>
          </div>

          {/* Repulsion Force */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">Node Repulsion (Charge)</span>
              <span className="text-sky-400">{config.charge}</span>
            </div>
            <input
              type="range"
              min="-1000"
              max="-100"
              step="50"
              value={config.charge}
              onChange={e => onUpdateConfig({ charge: Number(e.target.value) })}
              className="w-full accent-sky-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
          </div>

          {/* Link Distance */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">Link Distance</span>
              <span className="text-sky-400">{config.linkDistance}px</span>
            </div>
            <input
              type="range"
              min="30"
              max="220"
              step="10"
              value={config.linkDistance}
              onChange={e => onUpdateConfig({ linkDistance: Number(e.target.value) })}
              className="w-full accent-sky-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
          </div>

          {/* Collision Radius */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">Collision Padding</span>
              <span className="text-sky-400">{config.collisionRadius}px</span>
            </div>
            <input
              type="range"
              min="2"
              max="25"
              step="1"
              value={config.collisionRadius}
              onChange={e => onUpdateConfig({ collisionRadius: Number(e.target.value) })}
              className="w-full accent-sky-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
          </div>

          {/* Color Mode */}
          <div className="space-y-1">
            <label className="text-xs font-mono text-slate-400 block">
              Node Color Encoding
            </label>
            <div className="grid grid-cols-2 gap-1.5 text-xs font-mono">
              {(['depth', 'category', 'degree', 'connectivity'] as ColorMode[]).map(mode => (
                <button
                  key={mode}
                  onClick={() => onUpdateConfig({ colorMode: mode })}
                  className={`py-1 px-2 rounded-lg border text-center capitalize transition-colors ${
                    config.colorMode === mode
                      ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                      : 'bg-slate-800/80 text-slate-400 border-slate-700'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Label Visibility */}
          <div className="space-y-1">
            <label className="text-xs font-mono text-slate-400 block">
              Node Labels Display
            </label>
            <div className="grid grid-cols-3 gap-1.5 text-xs font-mono">
              {(['all', 'central', 'hover'] as LabelVisibility[]).map(mode => (
                <button
                  key={mode}
                  onClick={() => onUpdateConfig({ labelVisibility: mode })}
                  className={`py-1 px-2 rounded-lg border text-center capitalize transition-colors ${
                    config.labelVisibility === mode
                      ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                      : 'bg-slate-800/80 text-slate-400 border-slate-700'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Show Link Directional Arrows */}
          <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer pt-1 border-t border-slate-800">
            <span>Show Directional Arrows</span>
            <input
              type="checkbox"
              checked={config.showArrows}
              onChange={e => onUpdateConfig({ showArrows: e.target.checked })}
              className="rounded bg-slate-800 border-slate-700 text-sky-500 focus:ring-0"
            />
          </label>
        </div>
      )}
    </header>
  );
};
