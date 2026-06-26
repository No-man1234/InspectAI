/**
 * AI Website Inspector — Anthropic Claude REST API Client
 */

import { IAIClient } from './IAIClient';
import { AIReportSummary } from '../shared/types';
import { HeuristicReportGenerator } from './HeuristicReportGenerator';
import { MSG_GENERATE_AI_REPORT } from '../shared/constants';

export class AnthropicClient implements IAIClient {
  readonly providerName = 'Anthropic Claude';
  private apiKey: string;
  private model: string;
  private fallback = new HeuristicReportGenerator();

  constructor(apiKey: string, model: string = 'claude-3-5-sonnet-20240620') {
    this.apiKey = apiKey;
    this.model = model;
  }

  public async generateInspectionReport(prompt: string, payload: Record<string, unknown>): Promise<AIReportSummary> {
    if (!this.apiKey || this.apiKey.trim() === '') {
      return this.fallback.generateInspectionReport(prompt, payload);
    }

    const isContentScript = typeof window !== 'undefined' && typeof document !== 'undefined' && !window.location?.href?.startsWith('chrome-extension://');
    if (isContentScript && typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
      try {
        const bgResp = await chrome.runtime.sendMessage({
          action: MSG_GENERATE_AI_REPORT,
          payload: { provider: 'anthropic', apiKey: this.apiKey, model: this.model, prompt, data: payload },
        });
        if (bgResp && bgResp.success && bgResp.report) return bgResp.report;
      } catch {
        // proxy fallback
      }
    }

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: 4096,
          system: 'You are an expert Staff Software Architect and UX Consultant. Return valid JSON only.',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.2,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Anthropic error ${response.status}: ${errText.slice(0, 100)}`);
      }
      const data = await response.json();
      const text = data?.content?.[0]?.text;
      const parsed = JSON.parse(text);
      return { ...parsed, aiEngineUsed: `🤖 Live Cloud AI REST API Output (${this.model})` };
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.error('Anthropic error:', errMsg);
      const fb = await this.fallback.generateInspectionReport(prompt, payload);
      return { ...fb, aiEngineUsed: `⚙️ Offline Fallback (Anthropic Error: ${errMsg})` };
    }
  }
}
