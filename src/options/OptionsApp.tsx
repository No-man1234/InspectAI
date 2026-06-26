/**
 * AI Website Inspector — Options SaaS Configuration Portal
 */

import React, { useState, useEffect } from 'react';
import { UserSettings, AIProvider } from '../shared/types';
import { settingsManager } from '../settings/SettingsManager';
import { Sparkles, Key, Cpu, MessageSquareText, Shield, Save, RotateCcw, Check, Zap, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { GeminiClient } from '../ai/GeminiClient';
import { OpenAIClient } from '../ai/OpenAIClient';
import { AnthropicClient } from '../ai/AnthropicClient';
import { HeuristicReportGenerator } from '../ai/HeuristicReportGenerator';

export const OptionsApp: React.FC = () => {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [saved, setSaved] = useState(false);
  const [testingApi, setTestingApi] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; msg: string; timeMs?: number } | null>(null);

  useEffect(() => {
    settingsManager.getSettings().then(setSettings);
  }, []);

  if (!settings) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">Loading settings...</div>;
  }

  const updateAndSave = async (updated: UserSettings) => {
    setSettings(updated);
    await settingsManager.saveSettings(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    await settingsManager.saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleReset = async () => {
    if (confirm('Reset all configurations to factory defaults?')) {
      const def = await settingsManager.resetToDefaults();
      setSettings(def);
      setTestResult(null);
    }
  };

  const handleTestConnection = async () => {
    if (!settings) return;
    await settingsManager.saveSettings(settings);
    setTestingApi(true);
    setTestResult(null);
    const start = performance.now();

    try {
      let client;
      if (settings.aiProvider === 'gemini') {
        client = new GeminiClient(settings.apiKey, settings.selectedModel || 'gemini-2.5-pro');
      } else if (settings.aiProvider === 'openai') {
        client = new OpenAIClient(settings.apiKey, settings.selectedModel || 'gpt-4o');
      } else if (settings.aiProvider === 'anthropic') {
        client = new AnthropicClient(settings.apiKey, settings.selectedModel || 'claude-3-5-sonnet-20240620');
      } else {
        client = new HeuristicReportGenerator();
      }

      const testPrompt = `Return a valid JSON object with this exact structure: { "executiveSummary": "Connection verified!", "websiteOverview": "ok", "designPhilosophy": "ok", "targetAudience": "ok", "brandPersonalitySummary": "ok", "layoutExplanation": "ok", "typographyExplanation": "ok", "colorExplanation": "ok", "componentHighlights": [], "strengths": ["ok"], "weaknesses": ["ok"], "improvementSuggestions": ["ok"], "scorecard": { "professionalismScore": 100, "accessibilityScore": 100, "performanceScore": 100, "modernUiScore": 100, "maintainabilityScore": 100, "overallScore": 100 } }`;
      
      const res = await client.generateInspectionReport(testPrompt, { test: true, url: 'https://test.local', title: 'Test' });
      const elapsed = Math.round(performance.now() - start);

      if (res && res.scorecard && typeof res.scorecard.overallScore === 'number') {
        setTestResult({
          success: true,
          msg: `Verified ${settings.aiProvider.toUpperCase()} (${settings.selectedModel || 'default model'}). API active!`,
          timeMs: elapsed,
        });
      } else {
        setTestResult({ success: false, msg: `API returned unexpected JSON format. Check API key permissions.` });
      }
    } catch (err) {
      setTestResult({ success: false, msg: err instanceof Error ? err.message : String(err) });
    } finally {
      setTestingApi(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-6 flex justify-center">
      <div className="w-full max-w-3xl space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-indigo-600 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-sky-500/20">
              <Sparkles size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">AI Website Inspector Settings</h1>
              <p className="text-xs text-slate-400">Configure AI Providers, API Keys, and Principal Architect Persona instructions.</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Section 1: AI Provider */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sky-400 font-bold text-sm">
                <Cpu size={18} />
                <span>AI Engine & Model Selection</span>
              </div>
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testingApi}
                className="px-3.5 py-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50"
              >
                {testingApi ? <Loader2 size={13} className="animate-spin" /> : <Zap size={13} />}
                <span>{testingApi ? 'Testing Model...' : 'Test API Connection'}</span>
              </button>
            </div>

            {testResult && (
              <div className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                testResult.success ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}>
                <div className="flex items-center gap-2">
                  {testResult.success ? <CheckCircle2 size={16} className="text-emerald-400 shrink-0" /> : <AlertCircle size={16} className="text-rose-400 shrink-0" />}
                  <span className="font-medium">{testResult.msg}</span>
                </div>
                {testResult.timeMs && <span className="font-mono text-[11px] opacity-80">{testResult.timeMs}ms</span>}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">Active AI Provider</label>
                <select
                  value={settings.aiProvider}
                  onChange={(e) => {
                    updateAndSave({ ...settings, aiProvider: e.target.value as AIProvider });
                    setTestResult(null);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500 font-medium"
                >
                  <option value="heuristic">Built-in Staff Heuristic Engine (Free / No Key Needed)</option>
                  <option value="gemini">Google Gemini REST API</option>
                  <option value="openai">OpenAI (GPT-4o)</option>
                  <option value="anthropic">Anthropic Claude</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">Model Identifier</label>
                <input
                  type="text"
                  value={settings.selectedModel}
                  onChange={(e) => {
                    updateAndSave({ ...settings, selectedModel: e.target.value });
                    setTestResult(null);
                  }}
                  placeholder="e.g., gemini-3.1-pro or gpt-4o"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
                />
              </div>
            </div>

            {settings.aiProvider !== 'heuristic' && (
              <div className="pt-2">
                <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                  <Key size={14} className="text-amber-400" />
                  <span>API Key ({settings.aiProvider.toUpperCase()})</span>
                </label>
                <input
                  type="password"
                  value={settings.apiKey}
                  onChange={(e) => {
                    updateAndSave({ ...settings, apiKey: e.target.value });
                    setTestResult(null);
                  }}
                  placeholder="Paste your secret API key..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
                />
                <p className="text-[11px] text-slate-500 mt-1.5">
                  Stored locally and securely in your browser's `chrome.storage.local`. Never sent to external servers.
                </p>
              </div>
            )}
          </div>

          {/* Section 2: Custom Prompt Persona */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
              <MessageSquareText size={18} />
              <span>Custom Persona & Analysis Focus</span>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Additional Consultant Instructions</label>
              <textarea
                rows={4}
                value={settings.customPersonaPrompt || ''}
                onChange={(e) => setSettings({ ...settings, customPersonaPrompt: e.target.value })}
                placeholder="e.g., Focus heavily on WCAG AAA compliance and Next.js App Router server component performance optimizations..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500 leading-relaxed"
              />
            </div>
          </div>

          {/* Section 3: Extension Toggles */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <Shield size={18} />
              <span>Extension Runtime Preferences</span>
            </div>

            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-slate-200 block">Enable DevTools Bounding Box Overlay</span>
                  <span className="text-[11px] text-slate-400">Inject interactive Shadow DOM inspector on host webpage.</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.enableOverlay}
                  onChange={(e) => setSettings({ ...settings, enableOverlay: e.target.checked })}
                  className="w-4 h-4 rounded accent-sky-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-slate-200 block">Auto-Analyze on Popup Open</span>
                  <span className="text-[11px] text-slate-400">Automatically trigger inspection pipeline when popup mounts.</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.autoAnalyzeOnPopup}
                  onChange={(e) => setSettings({ ...settings, autoAnalyzeOnPopup: e.target.checked })}
                  className="w-4 h-4 rounded accent-sky-500"
                />
              </label>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-rose-400 text-xs font-semibold flex items-center gap-2 transition-colors border border-slate-800"
            >
              <RotateCcw size={14} />
              <span>Reset Defaults</span>
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-400 to-indigo-600 hover:from-sky-300 hover:to-indigo-500 text-slate-950 font-bold text-xs shadow-lg shadow-sky-500/20 flex items-center gap-2 transition-all"
            >
              {saved ? <Check size={16} className="text-slate-950" /> : <Save size={16} />}
              <span>{saved ? 'Settings Saved!' : 'Save Configurations'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
