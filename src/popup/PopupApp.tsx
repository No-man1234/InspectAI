/**
 * AI Website Inspector — Modern Popup SaaS UI Dashboard
 * Features multi-stage live progress bar, executive scorecard tabs, collapsible component trees, and export suite.
 */

import React, { useState, useEffect } from 'react';
import { CompleteInspectionResult, PipelineStageProgress } from '../shared/types';
import { MSG_START_ANALYSIS, MSG_PROGRESS_UPDATE, MSG_ANALYSIS_COMPLETE, MSG_TOGGLE_OVERLAY, MSG_HIGHLIGHT_SELECTOR } from '../shared/constants';
import { sendActiveTabMessage } from '../shared/messaging';
import { storageRepository } from '../storage/StorageRepository';
import { Exporters } from '../export/Exporters';
import { Sparkles, Play, Layers, Palette, History, Settings, Copy, Download, Eye, Pin, PinOff, Trash2, Check, ChevronRight, ChevronDown, Search, ShieldCheck, Zap, Code2, AlertTriangle, Lightbulb } from 'lucide-react';

export const PopupApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'components' | 'tokens' | 'history'>('dashboard');
  const [report, setReport] = useState<CompleteInspectionResult | null>(null);
  const [progress, setProgress] = useState<PipelineStageProgress | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [historyList, setHistoryList] = useState<CompleteInspectionResult[]>([]);
  const [pinnedIds, setPinnedIds] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isOverlayOn, setIsOverlayOn] = useState(true);

  // Load cached latest report & history on popup mount
  useEffect(() => {
    storageRepository.getCachedLatestReport().then((cached) => {
      if (cached) setReport(cached);
    });
    loadHistory();

    // Listen for live pipeline stage broadcasts from active tab
    const handleRuntimeMsg = (msg: { action: string; payload?: unknown }) => {
      if (msg.action === MSG_PROGRESS_UPDATE && msg.payload) {
        setProgress(msg.payload as PipelineStageProgress);
      }
      if (msg.action === MSG_ANALYSIS_COMPLETE && msg.payload) {
        setReport(msg.payload as CompleteInspectionResult);
        setIsAnalyzing(false);
        setProgress(null);
        loadHistory();
      }
    };
    chrome.runtime?.onMessage?.addListener(handleRuntimeMsg);
    return () => chrome.runtime?.onMessage?.removeListener(handleRuntimeMsg);
  }, []);

  const loadHistory = async () => {
    const list = await storageRepository.getHistory();
    setHistoryList(list);
    const pinned = await storageRepository.getPinnedReports();
    setPinnedIds(pinned.map((p) => p.id));
  };

  const startAnalysis = async () => {
    setIsAnalyzing(true);
    setError(null);
    setProgress({ stageId: 'COLLECT_RAW', label: '1/10 Initializing page inspection...', status: 'active', progressPercentage: 5 });

    try {
      const res = await sendActiveTabMessage<{ success: boolean; report?: CompleteInspectionResult; error?: string }>(MSG_START_ANALYSIS);
      if (res && res.success && res.report) {
        setReport(res.report);
      } else if (res?.error) {
        setError(res.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ensure you are on a valid http/https webpage.');
    } finally {
      setIsAnalyzing(false);
      setProgress(null);
    }
  };

  const toggleOverlay = async () => {
    const next = !isOverlayOn;
    setIsOverlayOn(next);
    sendActiveTabMessage(MSG_TOGGLE_OVERLAY, next).catch(() => {});
  };

  const triggerHighlight = (selector: string) => {
    sendActiveTabMessage(MSG_HIGHLIGHT_SELECTOR, selector).catch(() => {});
  };

  const copyMarkdown = () => {
    if (!report) return;
    navigator.clipboard.writeText(Exporters.generateMarkdown(report));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openOptions = () => {
    if (chrome.runtime?.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open('/options.html', '_blank');
    }
  };

  const togglePin = async (id: string) => {
    await storageRepository.togglePin(id);
    loadHistory();
  };

  const deleteItem = async (id: string) => {
    await storageRepository.deleteInspection(id);
    if (report?.id === id) setReport(null);
    loadHistory();
  };

  // Filter detected components by search query
  const filteredComponents = report?.detectedComponents.filter(
    (c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.category.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-slate-100 overflow-hidden">
      {/* Top Header */}
      <header className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-400 to-indigo-600 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-sky-500/20">
            <Sparkles size={18} />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
              AI Website Inspector
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 font-mono font-medium">PRO</span>
            </h1>
            <p className="text-[11px] text-slate-400 truncate max-w-[320px]">
              {report ? report.title : 'Staff-Level Frontend UX & Architectural Analyzer'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleOverlay}
            title={isOverlayOn ? 'Disable DevTools Page Overlay' : 'Enable DevTools Page Overlay'}
            className={`p-2 rounded-lg border text-xs font-medium transition-all flex items-center gap-1.5 ${
              isOverlayOn ? 'bg-sky-500/10 text-sky-400 border-sky-500/30' : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            <Eye size={14} />
          </button>
          <button
            onClick={openOptions}
            title="API Keys & Model Settings"
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
          >
            <Settings size={14} />
          </button>
          <button
            onClick={startAnalysis}
            disabled={isAnalyzing}
            className="px-3.5 py-2 rounded-lg bg-gradient-to-r from-sky-400 to-blue-600 hover:from-sky-300 hover:to-blue-500 text-slate-950 font-semibold text-xs transition-all shadow-md shadow-sky-500/20 flex items-center gap-2 disabled:opacity-50"
          >
            <Play size={13} className={isAnalyzing ? 'animate-spin' : 'fill-current'} />
            <span>{isAnalyzing ? 'Analyzing...' : 'Inspect Page'}</span>
          </button>
        </div>
      </header>

      {/* Live Pipeline Progress Bar */}
      {(isAnalyzing || progress) && (
        <div className="px-5 py-3 bg-slate-900 border-b border-sky-500/20 shrink-0">
          <div className="flex justify-between text-xs font-medium mb-1.5">
            <span className="text-sky-400 flex items-center gap-1.5">
              <Sparkles size={13} className="animate-pulse" />
              {progress?.label || 'Processing architectural pipeline...'}
            </span>
            <span className="font-mono text-slate-400">{progress?.progressPercentage || 10}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-sky-400 to-indigo-500 rounded-full transition-all duration-300"
              style={{ width: `${progress?.progressPercentage || 10}%` }}
            />
          </div>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="px-5 py-2.5 bg-rose-500/10 border-b border-rose-500/20 text-rose-300 text-xs flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <AlertTriangle size={15} className="text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-rose-400 font-bold ml-3">✕</button>
        </div>
      )}

      {/* Navigation Tabs */}
      <nav className="flex border-b border-slate-800 px-5 bg-slate-950 shrink-0 text-xs font-medium">
        {[
          { id: 'dashboard', label: 'Executive Audit', icon: Sparkles },
          { id: 'components', label: `Components (${report?.detectedComponents.length || 0})`, icon: Layers },
          { id: 'tokens', label: 'Design System', icon: Palette },
          { id: 'history', label: 'History & Saved', icon: History },
        ].map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as unknown as any)}
              className={`flex items-center gap-2 py-3 px-3 border-b-2 transition-all ${
                isActive
                  ? 'border-sky-400 text-sky-400 font-semibold bg-slate-900/40'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon size={14} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Tab Body Container */}
      <main className="flex-1 overflow-y-auto p-5 space-y-5">
        {!report && !isAnalyzing && (
          <div className="h-full flex flex-col items-center justify-center text-center py-16 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-sky-400 shadow-xl">
              <Sparkles size={32} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-200">Ready to Inspect Webpage</h3>
              <p className="text-xs text-slate-400 max-w-sm mt-1">
                Click "Inspect Page" above to launch the 10-stage AI consulting pipeline. We will evaluate architecture, layout flow, accessibility, and design intent.
              </p>
            </div>
            <button
              onClick={startAnalysis}
              className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-sky-500/25 mt-2"
            >
              Start Instant Inspection
            </button>
          </div>
        )}

        {/* TAB 1: EXECUTIVE DASHBOARD */}
        {report && activeTab === 'dashboard' && (
          <div className="space-y-5">
            {/* Scorecard Cards */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Overall Grade', score: report.aiReport.scorecard.overallScore, color: 'text-sky-400 border-sky-500/30 bg-sky-500/5' },
                { label: 'Professionalism', score: report.aiReport.scorecard.professionalismScore, color: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/5' },
                { label: 'Accessibility', score: report.aiReport.scorecard.accessibilityScore, color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/5' },
              ].map((s, i) => (
                <div key={i} className={`p-3.5 rounded-xl border flex flex-col items-center text-center ${s.color}`}>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{s.label}</span>
                  <span className="text-2xl font-black mt-1 font-mono">{s.score}<span className="text-xs text-slate-500 font-normal">/100</span></span>
                </div>
              ))}
            </div>

            {/* Sub scorecard bars */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Detailed Architectural Breakdown</span>
              <div className="grid grid-cols-3 gap-4 pt-1">
                {[
                  { name: 'Runtime Perf', val: report.aiReport.scorecard.performanceScore },
                  { name: 'Modern UI', val: report.aiReport.scorecard.modernUiScore },
                  { name: 'Maintainability', val: report.aiReport.scorecard.maintainabilityScore },
                ].map((b, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-400">{b.name}</span>
                      <span className="font-mono text-slate-300 font-semibold">{b.val}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-sky-400 rounded-full" style={{ width: `${b.val}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Executive Summary Card */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-sky-400 font-bold text-xs">
                <Sparkles size={14} />
                <span>Executive Architectural Synthesis</span>
              </div>
              <p className="text-xs leading-relaxed text-slate-300 whitespace-pre-line">{report.aiReport.executiveSummary}</p>
            </div>

            {/* Design Philosophy & Audience */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                <span className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
                  <Palette size={14} /> Aesthetic Framework
                </span>
                <p className="text-xs leading-relaxed text-slate-300">{report.aiReport.designPhilosophy}</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <ShieldCheck size={14} /> Target Audience
                </span>
                <p className="text-xs leading-relaxed text-slate-300">{report.aiReport.targetAudience}</p>
              </div>
            </div>

            {/* Strengths vs Weaknesses */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-2.5">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  ✅ Key Architectural Strengths
                </span>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {report.aiReport.strengths.map((st, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-emerald-400 mt-0.5">•</span>
                      <span>{st}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-2.5">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  ⚠️ Friction & Technical Debt
                </span>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {report.aiReport.weaknesses.map((wk, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-amber-400 mt-0.5">•</span>
                      <span>{wk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Improvement Suggestions */}
            <div className="p-4 rounded-xl bg-sky-500/5 border border-sky-500/20 space-y-3">
              <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                <Lightbulb size={15} /> Principal Architect Optimizations
              </span>
              <div className="space-y-2">
                {report.aiReport.improvementSuggestions.map((sug, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs">
                    <span className="w-5 h-5 rounded bg-sky-500/10 text-sky-400 font-bold font-mono flex items-center justify-center shrink-0">{idx + 1}</span>
                    <span className="text-slate-300 pt-0.5">{sug}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DETECTED COMPONENTS */}
        {report && activeTab === 'components' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="relative flex-1 max-w-xs">
                <Search size={14} className="absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Filter components..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                />
              </div>
              <button
                onClick={() => Exporters.exportComponentTreeJson(report)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1.5 border border-slate-700"
              >
                <Code2 size={13} />
                <span>Export JSON Tree</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {filteredComponents.map((comp) => (
                <div key={comp.id} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 text-[10px] font-semibold tracking-wider uppercase border border-sky-500/20">
                        {comp.category}
                      </span>
                      <h4 className="text-xs font-bold text-white">{comp.name}</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-slate-400">{comp.dimensionsText}</span>
                      <button
                        onClick={() => triggerHighlight(comp.selector)}
                        title="Highlight on webpage"
                        className="p-1 rounded bg-slate-800 hover:bg-sky-500 hover:text-slate-950 text-sky-400 transition-colors"
                      >
                        <Eye size={13} />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 leading-normal">{comp.aiExplanation}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: DESIGN SYSTEM TOKENS */}
        {report && activeTab === 'tokens' && (
          <div className="space-y-5">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Design Token Extraction</h3>
                <p className="text-[11px] text-slate-400">Methodology: {report.cssAnalysis.detectedMethodology}</p>
              </div>
              <button
                onClick={() => Exporters.exportTokensJson(report)}
                className="px-3 py-1.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/30 text-xs font-semibold hover:bg-sky-500/20 flex items-center gap-1.5"
              >
                <Download size={13} />
                <span>Export Tokens JSON</span>
              </button>
            </div>

            {/* Color Palette Swatches */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-slate-300">Color Palette System</span>
              <div className="grid grid-cols-4 gap-3">
                {Object.entries(report.designTokens.colorPalette).map(([name, hex]) => (
                  <div key={name} className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-950 border border-slate-800">
                    <div className="w-7 h-7 rounded border border-slate-700 shrink-0" style={{ backgroundColor: hex }} />
                    <div className="overflow-hidden">
                      <div className="text-[11px] font-bold capitalize truncate text-slate-200">{name}</div>
                      <div className="text-[10px] font-mono text-slate-400 truncate">{hex}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Typography Scale */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-slate-300">Typography Scale System</span>
              <div className="grid grid-cols-4 gap-2">
                {Object.entries(report.designTokens.typographyScale).map(([token, size]) => (
                  <div key={token} className="p-2 rounded bg-slate-950 border border-slate-800 flex justify-between text-xs font-mono">
                    <span className="text-slate-400">{token}</span>
                    <span className="text-sky-400 font-semibold">{size}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: HISTORY & SAVED */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Analysis Archives ({historyList.length})</h3>
              <button
                onClick={async () => {
                  await storageRepository.clearHistory();
                  loadHistory();
                }}
                className="text-xs text-rose-400 hover:underline"
              >
                Clear Archives
              </button>
            </div>

            <div className="space-y-2.5">
              {historyList.map((item) => {
                const isPinned = pinnedIds.includes(item.id);
                return (
                  <div key={item.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div className="overflow-hidden pr-3 cursor-pointer flex-1" onClick={() => setReport(item)}>
                      <div className="flex items-center gap-2">
                        {isPinned && <Pin size={12} className="text-amber-400 fill-current shrink-0" />}
                        <h4 className="text-xs font-bold text-white truncate">{item.title}</h4>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono truncate block mt-0.5">{item.url}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button onClick={() => togglePin(item.id)} title={isPinned ? 'Unpin' : 'Pin report'} className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-amber-400">
                        {isPinned ? <PinOff size={14} /> : <Pin size={14} />}
                      </button>
                      <button onClick={() => Exporters.exportHtmlReport(item)} title="Export HTML" className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-sky-400">
                        <Download size={14} />
                      </button>
                      <button onClick={() => deleteItem(item.id)} title="Delete" className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-rose-400">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Footer Export Suite */}
      {report && (
        <footer className="px-5 py-3 bg-slate-900/90 border-t border-slate-800 shrink-0 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={copyMarkdown}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium flex items-center gap-1.5 transition-colors border border-slate-700"
            >
              {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
              <span>{copied ? 'Copied MD!' : 'Copy Report MD'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => Exporters.exportJson(report)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors border border-slate-700"
            >
              JSON
            </button>
            <button
              onClick={() => Exporters.exportHtmlReport(report)}
              className="px-3.5 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold transition-all shadow-md shadow-sky-500/20 flex items-center gap-1.5"
            >
              <Download size={13} />
              <span>HTML / PDF Report</span>
            </button>
          </div>
        </footer>
      )}
    </div>
  );
};
