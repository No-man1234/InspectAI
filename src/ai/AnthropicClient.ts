/**
 * AI Website Inspector — Anthropic Claude REST API Client
 */

import { IAIClient } from './IAIClient';
import { AIReportSummary } from '../shared/types';
import { HeuristicReportGenerator } from './HeuristicReportGenerator';

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

      if (!response.ok) throw new Error(`Anthropic error ${response.status}`);
      const data = await response.json();
      const text = data?.content?.[0]?.text;
      return JSON.parse(text);
    } catch (err) {
      console.error('Anthropic error:', err);
      return this.fallback.generateInspectionReport(prompt, payload);
    }
  }
}
