/**
 * AI Website Inspector — OpenAI REST API Client
 */

import { IAIClient } from './IAIClient';
import { AIReportSummary } from '../shared/types';
import { HeuristicReportGenerator } from './HeuristicReportGenerator';
import { MSG_GENERATE_AI_REPORT } from '../shared/constants';

export class OpenAIClient implements IAIClient {
  readonly providerName = 'OpenAI';
  private apiKey: string;
  private model: string;
  private fallback = new HeuristicReportGenerator();

  constructor(apiKey: string, model: string = 'gpt-4o') {
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
          payload: { provider: 'openai', apiKey: this.apiKey, model: this.model, prompt, data: payload },
        });
        if (bgResp && bgResp.success && bgResp.report) return bgResp.report;
      } catch {
        // proxy fallback
      }
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: 'You are an expert Staff Software Architect and UX Consultant. Return JSON.' },
            { role: 'user', content: prompt },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.2,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`OpenAI error ${response.status}: ${errText.slice(0, 100)}`);
      }
      const data = await response.json();
      const text = data?.choices?.[0]?.message?.content;
      const parsed = JSON.parse(text);
      return { ...parsed, aiEngineUsed: `🤖 Live Cloud AI REST API Output (${this.model})` };
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.error('OpenAI error:', errMsg);
      const fb = await this.fallback.generateInspectionReport(prompt, payload);
      return { ...fb, aiEngineUsed: `⚙️ Offline Fallback (OpenAI Error: ${errMsg})` };
    }
  }
}
