/**
 * AI Website Inspector — Google Gemini REST API Client
 */

import { IAIClient } from './IAIClient';
import { AIReportSummary } from '../shared/types';
import { HeuristicReportGenerator } from './HeuristicReportGenerator';
import { MSG_GENERATE_AI_REPORT } from '../shared/constants';

export class GeminiClient implements IAIClient {
  readonly providerName = 'Google Gemini AI';
  private apiKey: string;
  private model: string;
  private fallback = new HeuristicReportGenerator();

  constructor(apiKey: string, model: string = 'gemini-1.5-flash') {
    this.apiKey = apiKey;
    this.model = model || 'gemini-1.5-flash';
  }

  private cleanJson(raw: string): string {
    let clean = raw.trim();
    if (clean.startsWith('```json')) clean = clean.slice(7);
    else if (clean.startsWith('```')) clean = clean.slice(3);
    if (clean.endsWith('```')) clean = clean.slice(0, -3);
    return clean.trim();
  }

  public async generateInspectionReport(prompt: string, payload: Record<string, unknown>): Promise<AIReportSummary> {
    if (!this.apiKey || this.apiKey.trim() === '') {
      console.warn('Gemini API key unconfigured. Falling back to built-in Heuristic Engine.');
      const fb = await this.fallback.generateInspectionReport(prompt, payload);
      return { ...fb, aiEngineUsed: '⚙️ Built-in Staff Heuristic Engine (Missing API Key)' };
    }

    const isContentScript = typeof window !== 'undefined' && typeof document !== 'undefined' && !window.location?.href?.startsWith('chrome-extension://');
    if (isContentScript && typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
      try {
        const bgResp = await chrome.runtime.sendMessage({
          action: MSG_GENERATE_AI_REPORT,
          payload: { provider: 'gemini', apiKey: this.apiKey, model: this.model, prompt, data: payload },
        });
        if (bgResp && bgResp.success && bgResp.report) return bgResp.report;
      } catch {
        // proxy failure fallback
      }
    }

    try {
      const activeModel = this.model.includes('3.1') ? 'gemini-1.5-flash' : this.model;
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${activeModel}:generateContent?key=${this.apiKey}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            response_mime_type: 'application/json',
          },
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error(`Google Gemini API Error (${response.status}):`, errText);
        throw new Error(`Status ${response.status}: ${errText.slice(0, 100)}`);
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) {
        throw new Error('Empty text candidate returned from Gemini.');
      }

      const parsed: AIReportSummary = JSON.parse(this.cleanJson(rawText));
      return { ...parsed, aiEngineUsed: `🤖 Live Cloud AI REST API Output (${activeModel})` };
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.error('Gemini API execution error:', errMsg);
      const fb = await this.fallback.generateInspectionReport(prompt, payload);
      return { ...fb, aiEngineUsed: `⚙️ Offline Fallback (Gemini API Error: ${errMsg})` };
    }
  }
}
