/**
 * AI Website Inspector — OpenAI REST API Client
 */

import { IAIClient } from './IAIClient';
import { AIReportSummary } from '../shared/types';
import { HeuristicReportGenerator } from './HeuristicReportGenerator';

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

      if (!response.ok) throw new Error(`OpenAI error ${response.status}`);
      const data = await response.json();
      const text = data?.choices?.[0]?.message?.content;
      return JSON.parse(text);
    } catch (err) {
      console.error('OpenAI error:', err);
      return this.fallback.generateInspectionReport(prompt, payload);
    }
  }
}
